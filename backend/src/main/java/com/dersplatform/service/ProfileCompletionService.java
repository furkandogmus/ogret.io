package com.dersplatform.service;

import com.dersplatform.model.dto.response.ProfileCompletionResponse;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.TutorAvailabilityRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.TutorSubjectRepository;
import com.dersplatform.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * The single source of truth for profile readiness and its percentage.
 *
 * Email and identity verification intentionally do not participate in this
 * calculation: neither one is required to use the first release.
 */
@Service
@RequiredArgsConstructor
public class ProfileCompletionService {

    private final UserRepository userRepository;
    private final TutorSubjectRepository tutorSubjectRepository;
    private final TutorListingRepository tutorListingRepository;
    private final TutorAvailabilityRepository tutorAvailabilityRepository;
    private final EntityManager entityManager;

    @Transactional
    public ProfileCompletionResponse refresh(User user) {
        ProfileCompletionResponse completion = calculate(user);
        if (user.getProfileCompletionScore() == null
                || user.getProfileCompletionScore() != completion.getScore()
                || user.isProfileComplete() != completion.isComplete()) {
            user.setProfileCompletionScore(completion.getScore());
            user.setProfileComplete(completion.isComplete());
            // New users are already managed by the registration transaction.
            // Calling repository.save again before their INSERT is flushed makes
            // Spring Data choose merge (the generated UUID is already present),
            // which can issue an UPDATE with a null @CreationTimestamp.
            if (!entityManager.contains(user)) {
                userRepository.save(user);
            }
        }
        return completion;
    }

    @Transactional(readOnly = true)
    public ProfileCompletionResponse calculate(User user) {
        if (user.getRole() == Role.ADMIN) {
            return response(List.of());
        }

        List<ProfileCompletionResponse.Item> items = new ArrayList<>();
        items.add(item("fullName", "Ad soyad", hasText(user.getFullName())));
        items.add(item("phone", "Telefon", hasText(user.getPhone())));
        items.add(item("avatarUrl", "Profil fotoğrafı", hasText(user.getAvatarUrl())));

        if (user.getRole() == Role.TUTOR) {
            items.add(item("bio", "Kısa tanıtım", hasText(user.getBio())));
            items.add(item("education", "Eğitim bilgisi", hasText(user.getEducation())));
            items.add(item("experienceYears", "Deneyim yılı",
                    user.getExperienceYears() != null && user.getExperienceYears() >= 0));
            items.add(item("hourlyRate", "Ders ücreti",
                    user.getHourlyRate() != null && user.getHourlyRate().compareTo(BigDecimal.ZERO) > 0));
            items.add(item("subjects", "Ders konuları",
                    tutorSubjectRepository.existsByTutorId(user.getId())));
            items.add(item("activeListing", "Aktif ders ilanı",
                    tutorListingRepository.existsByTutorIdAndStatus(user.getId(), "ACTIVE")));
            items.add(item("availability", "Haftalık müsaitlik",
                    tutorAvailabilityRepository.existsByTutorIdAndIsActiveTrue(user.getId())));
        }

        return response(items);
    }

    private ProfileCompletionResponse response(List<ProfileCompletionResponse.Item> items) {
        if (items.isEmpty()) {
            return ProfileCompletionResponse.builder()
                    .score(100)
                    .complete(true)
                    .completedItems(0)
                    .totalItems(0)
                    .items(List.of())
                    .build();
        }

        int completed = (int) items.stream().filter(ProfileCompletionResponse.Item::isCompleted).count();
        int score = (int) Math.round(completed * 100.0 / items.size());
        return ProfileCompletionResponse.builder()
                .score(score)
                .complete(completed == items.size())
                .completedItems(completed)
                .totalItems(items.size())
                .items(List.copyOf(items))
                .build();
    }

    private ProfileCompletionResponse.Item item(String key, String label, boolean completed) {
        return ProfileCompletionResponse.Item.builder()
                .key(key)
                .label(label)
                .completed(completed)
                .build();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
