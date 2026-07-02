package com.dersplatform.controller;

import com.dersplatform.model.entity.*;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.*;
import com.dersplatform.service.TutorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tutors/me")
@RequiredArgsConstructor
public class TutorProfileController {

    private final UserRepository userRepository;
    private final TutorSubjectRepository tutorSubjectRepository;
    private final TutorAvailabilityRepository tutorAvailabilityRepository;
    private final SubjectRepository subjectRepository;
    private final TutorService tutorService;

    @GetMapping("/subjects")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<List<Map<String, Object>>> getMySubjects(
            @AuthenticationPrincipal UserDetails userDetails) {
        User tutor = userRepository.findById(UUID.fromString(userDetails.getUsername()))
                .orElseThrow();
        return ResponseEntity.ok(tutorSubjectRepository.findByTutorId(tutor.getId())
                .stream()
                .map(ts -> Map.<String, Object>of(
                        "id", ts.getId().toString(),
                        "subjectId", ts.getSubject().getId().toString(),
                        "subjectName", ts.getSubject().getName(),
                        "description", ts.getDescription() != null ? ts.getDescription() : "",
                        "hourlyRate", ts.getHourlyRate()
                ))
                .toList());
    }

    @PutMapping("/subjects")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<Void> updateMySubjects(
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
        return ResponseEntity.ok().build();
    }

    @GetMapping("/availability")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<List<Map<String, Object>>> getMyAvailability(
            @AuthenticationPrincipal UserDetails userDetails) {
        User tutor = userRepository.findById(UUID.fromString(userDetails.getUsername()))
                .orElseThrow();
        return ResponseEntity.ok(tutorAvailabilityRepository.findByTutorId(tutor.getId())
                .stream()
                .map(a -> Map.<String, Object>of(
                        "id", a.getId().toString(),
                        "dayOfWeek", a.getDayOfWeek(),
                        "startTime", a.getStartTime().toString(),
                        "endTime", a.getEndTime().toString(),
                        "isActive", a.isActive()
                ))
                .toList());
    }

    @PutMapping("/availability")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<Void> updateMyAvailability(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody List<Map<String, Object>> slots) {
        User tutor = userRepository.findById(UUID.fromString(userDetails.getUsername()))
                .orElseThrow();
        tutorAvailabilityRepository.deleteAll(tutorAvailabilityRepository.findByTutorId(tutor.getId()));
        for (Map<String, Object> slot : slots) {
            tutorAvailabilityRepository.save(TutorAvailability.builder()
                    .tutor(tutor)
                    .dayOfWeek((Integer) slot.get("dayOfWeek"))
                    .startTime(LocalTime.parse((String) slot.get("startTime")))
                    .endTime(LocalTime.parse((String) slot.get("endTime")))
                    .isActive(true)
                    .build());
        }
        return ResponseEntity.ok().build();
    }
}
