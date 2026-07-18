package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.entity.TutorListing;
import com.dersplatform.model.entity.Subject;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TutorOnboardingService {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final TutorListingRepository tutorListingRepository;
    private final ProfileCompletionService profileCompletionService;

    public Map<String, Object> getProgress(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        if (user.getRole() != Role.TUTOR) {
            throw ApiException.forbidden("Bu sayfa yalnızca öğretmenler içindir");
        }

        var completion = profileCompletionService.refresh(user);
        Map<String, Object> progress = new LinkedHashMap<>();
        List<Map<String, Object>> steps = new ArrayList<>();
        for (int index = 0; index < completion.getItems().size(); index++) {
            var item = completion.getItems().get(index);
            steps.add(Map.of(
                    "id", index + 1,
                    "title", item.getLabel(),
                    "fields", List.of(item.getKey()),
                    "completed", item.isCompleted()
            ));
        }

        progress.put("percentage", completion.getScore());
        progress.put("complete", completion.isComplete());
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
        user = userRepository.save(user);
        profileCompletionService.refresh(user);
        return user;
    }

    @Transactional
    public User updateStep2(UUID userId, Integer hourlyRate, Integer experienceYears) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        user.setHourlyRate(hourlyRate != null ? java.math.BigDecimal.valueOf(hourlyRate) : null);
        user.setExperienceYears(experienceYears);
        user = userRepository.save(user);
        profileCompletionService.refresh(user);
        return user;
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
                .hourlyRate(tutor.getHourlyRate() != null ? tutor.getHourlyRate() : java.math.BigDecimal.ZERO)
                .allowsOnline(allowsOnline)
                .status("ACTIVE")
                .build();

        TutorListing saved = tutorListingRepository.save(listing);
        tutorListingRepository.flush();
        profileCompletionService.refresh(tutor);
        return saved;
    }
}
