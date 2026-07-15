package com.dersplatform.controller;

import com.dersplatform.model.entity.*;
import com.dersplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
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
