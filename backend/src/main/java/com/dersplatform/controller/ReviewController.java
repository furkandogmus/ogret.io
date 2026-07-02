package com.dersplatform.controller;

import com.dersplatform.model.dto.request.CreateReviewRequest;
import com.dersplatform.model.dto.response.ReviewResponse;
import com.dersplatform.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/lessons/{lessonId}/review")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable UUID lessonId,
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        request.setLessonId(lessonId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(UUID.fromString(userDetails.getUsername()), request));
    }

    @GetMapping("/tutors/{tutorId}/reviews")
    public ResponseEntity<List<ReviewResponse>> getTutorReviews(@PathVariable UUID tutorId) {
        return ResponseEntity.ok(reviewService.getTutorReviews(tutorId));
    }

    @GetMapping("/reviews")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reviewService.getStudentReviews(UUID.fromString(userDetails.getUsername())));
    }
}
