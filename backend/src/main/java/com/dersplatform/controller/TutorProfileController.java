package com.dersplatform.controller;

import com.dersplatform.model.entity.*;
import com.dersplatform.model.dto.request.UpdateTutorAvailabilityRequest;
import com.dersplatform.model.dto.response.TutorAvailabilityResponse;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.repository.*;
import com.dersplatform.service.TutorAvailabilityService;
import com.dersplatform.service.ProfileCompletionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tutors/me")
@RequiredArgsConstructor
public class TutorProfileController {

    private final UserRepository userRepository;
    private final TutorSubjectRepository tutorSubjectRepository;
    private final SubjectRepository subjectRepository;
    private final TutorAvailabilityService tutorAvailabilityService;
    private final ProfileCompletionService profileCompletionService;

    @GetMapping("/subjects")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<List<Map<String, Object>>> getMySubjects(
            @AuthenticationPrincipal UserDetails userDetails) {
        User tutor = userRepository.findById(UUID.fromString(userDetails.getUsername()))
                .orElseThrow();
        java.util.List<java.util.Map<String, Object>> result = tutorSubjectRepository.findByTutorId(tutor.getId())
                .stream()
                .<java.util.Map<String, Object>>map(ts -> {
                    var map = new java.util.HashMap<String, Object>();
                    map.put("id", ts.getId().toString());
                    map.put("subjectId", ts.getSubject().getId().toString());
                    map.put("subjectName", ts.getSubject().getName());
                    map.put("description", ts.getDescription() != null ? ts.getDescription() : "");
                    if (ts.getHourlyRate() != null) {
                        map.put("hourlyRate", ts.getHourlyRate());
                    }
                    return map;
                })
                .toList();
        return ResponseEntity.ok(result);
    }

    @PutMapping("/subjects")
    @PreAuthorize("hasRole('TUTOR')")
    @CacheEvict(value = {"tutorDetail", "subjects"}, allEntries = true)
    public ResponseEntity<UserResponse> updateMySubjects(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody List<UUID> subjectIds) {
        User tutor = userRepository.findById(UUID.fromString(userDetails.getUsername()))
                .orElseThrow();
        tutorSubjectRepository.deleteAll(tutorSubjectRepository.findByTutorId(tutor.getId()));
        for (UUID subjectId : subjectIds) {
            Subject subject = subjectRepository.findById(subjectId).orElseThrow();
            tutorSubjectRepository.save(TutorSubject.builder()
                    .tutor(tutor).subject(subject).build());
        }
        tutorSubjectRepository.flush();
        return ResponseEntity.ok(UserResponse.fromEntity(tutor, profileCompletionService.refresh(tutor)));
    }

    @GetMapping("/availability")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<List<TutorAvailabilityResponse>> getMyAvailability(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tutorAvailabilityService.getMyAvailability(
                UUID.fromString(userDetails.getUsername())));
    }

    @PutMapping("/availability")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<List<TutorAvailabilityResponse>> updateMyAvailability(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody List<@Valid UpdateTutorAvailabilityRequest> slots) {
        return ResponseEntity.ok(tutorAvailabilityService.updateMyAvailability(
                UUID.fromString(userDetails.getUsername()), slots));
    }
}
