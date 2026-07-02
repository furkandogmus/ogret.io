package com.dersplatform.controller;

import com.dersplatform.model.dto.request.CreateLessonRequest;
import com.dersplatform.model.dto.response.LessonResponse;
import com.dersplatform.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @PostMapping
    public ResponseEntity<LessonResponse> createLesson(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateLessonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(lessonService.createLesson(UUID.fromString(userDetails.getUsername()), request));
    }

    @GetMapping
    public ResponseEntity<List<LessonResponse>> getMyLessons(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "student") String as) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        if ("tutor".equals(as)) {
            return ResponseEntity.ok(lessonService.getTutorLessons(userId));
        }
        return ResponseEntity.ok(lessonService.getStudentLessons(userId));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<LessonResponse> confirmLesson(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(lessonService.confirmLesson(id, UUID.fromString(userDetails.getUsername())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonResponse> getLesson(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(lessonService.getLessonById(id, UUID.fromString(userDetails.getUsername())));
    }

    @PutMapping("/{id}/meeting-link")
    public ResponseEntity<LessonResponse> updateMeetingLink(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(lessonService.updateMeetingLink(
                id, UUID.fromString(userDetails.getUsername()), body.get("meetingLink")));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<LessonResponse> cancelLesson(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(lessonService.cancelLesson(id, UUID.fromString(userDetails.getUsername()), reason));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<LessonResponse> completeLesson(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(lessonService.completeLesson(id, UUID.fromString(userDetails.getUsername())));
    }
}
