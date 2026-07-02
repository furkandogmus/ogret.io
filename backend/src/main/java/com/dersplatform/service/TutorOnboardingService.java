package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.entity.TutorListing;
import com.dersplatform.model.entity.Subject;
import com.dersplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TutorOnboardingService {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final TutorListingRepository tutorListingRepository;

    public Map<String, Object> getProgress(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        if (user.getRole() != null && !user.getRole().equals("TUTOR")) {
            throw ApiException.forbidden("Bu sayfa yalnızca öğretmenler içindir");
        }

        Map<String, Object> progress = new LinkedHashMap<>();
        List<Map<String, Object>> steps = new ArrayList<>();

        boolean step1 = user.getFullName() != null && !user.getFullName().isBlank()
                && user.getPhone() != null && !user.getPhone().isBlank();
        steps.add(Map.of(
                "id", 1, "title", "Profesyonel Bilgiler",
                "fields", List.of("fullName", "phone", "bio", "education"),
                "completed", step1
        ));

        boolean step2 = user.getHourlyRate() != null && user.getHourlyRate().compareTo(BigDecimal.ZERO) > 0;
        steps.add(Map.of(
                "id", 2, "title", "Hizmet Detayları",
                "fields", List.of("hourlyRate", "experienceYears"),
                "completed", step2
        ));

        boolean step3 = !tutorListingRepository.findByTutorIdAndStatusOrderByCreatedAtDesc(userId, "ACTIVE").isEmpty();
        steps.add(Map.of(
                "id", 3, "title", "Ders İlanı Oluştur",
                "fields", List.of("title", "description", "subject"),
                "completed", step3
        ));

        boolean step4 = user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank();
        steps.add(Map.of(
                "id", 4, "title", "Profil Fotoğrafı",
                "fields", List.of("avatarUrl"),
                "completed", step4
        ));

        boolean step5 = user.isIdentityVerified();
        steps.add(Map.of(
                "id", 5, "title", "Kimlik Doğrulama",
                "fields", List.of("identityVerified"),
                "completed", step5
        ));

        long completedCount = steps.stream().filter(s -> (boolean) s.get("completed")).count();
        int percentage = (int) (completedCount * 100 / steps.size());

        progress.put("percentage", percentage);
        progress.put("steps", steps);

        return progress;
    }

    @Transactional
    public User updateStep1(UUID userId, String fullName, String phone, String bio, String education) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        user.setFullName(fullName);
        user.setPhone(phone);
        user.setBio(bio);
        user.setEducation(education);
        return userRepository.save(user);
    }

    @Transactional
    public User updateStep2(UUID userId, BigDecimal hourlyRate, Integer experienceYears) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        user.setHourlyRate(hourlyRate);
        user.setExperienceYears(experienceYears);
        return userRepository.save(user);
    }

    @Transactional
    public TutorListing createListing(UUID tutorId, UUID subjectId, String title,
                                       String lessonDescription, String aboutTutor,
                                       boolean allowsOnline) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> ApiException.notFound("Ders bulunamadı"));

        TutorListing listing = TutorListing.builder()
                .tutor(tutor)
                .subject(subject)
                .title(title)
                .lessonDescription(lessonDescription)
                .aboutTutor(aboutTutor)
                .hourlyRate(tutor.getHourlyRate() != null ? tutor.getHourlyRate() : BigDecimal.ZERO)
                .allowsOnline(allowsOnline)
                .status("ACTIVE")
                .build();

        return tutorListingRepository.save(listing);
    }
}
