package com.dersplatform.controller;

import com.dersplatform.model.entity.TutorListing;
import com.dersplatform.service.TutorOnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tutor-onboarding")
@RequiredArgsConstructor
public class TutorOnboardingController {

    private final TutorOnboardingService tutorOnboardingService;

    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getProgress(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(tutorOnboardingService.getProgress(userId));
    }

    @PutMapping("/step1")
    public ResponseEntity<Map<String, Object>> updateStep1(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        var user = tutorOnboardingService.updateStep1(
                userId,
                (String) body.get("fullName"),
                (String) body.get("phone"),
                (String) body.get("bio"),
                (String) body.get("education"));
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "phone", user.getPhone(),
                "bio", user.getBio(),
                "education", user.getEducation()
        ));
    }

    @PutMapping("/step2")
    public ResponseEntity<Map<String, Object>> updateStep2(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        var user = tutorOnboardingService.updateStep2(
                userId,
                body.get("hourlyRate") != null ? new BigDecimal(body.get("hourlyRate").toString()) : null,
                body.get("experienceYears") != null ? (Integer) body.get("experienceYears") : null);
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "hourlyRate", user.getHourlyRate(),
                "experienceYears", user.getExperienceYears()
        ));
    }

    @PostMapping("/step3")
    public ResponseEntity<TutorListing> createListing(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(tutorOnboardingService.createListing(
                userId,
                UUID.fromString((String) body.get("subjectId")),
                (String) body.get("title"),
                (String) body.get("lessonDescription"),
                (String) body.get("aboutTutor"),
                body.get("allowsOnline") == null || (Boolean) body.get("allowsOnline")));
    }
}
