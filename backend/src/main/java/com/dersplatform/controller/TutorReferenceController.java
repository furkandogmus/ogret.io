package com.dersplatform.controller;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.CreateReferenceRequest;
import com.dersplatform.model.dto.response.ReferenceResponse;
import com.dersplatform.service.TutorReferenceService;
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
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TutorReferenceController {

    private final TutorReferenceService tutorReferenceService;

    @PostMapping("/tutors/{tutorId}/references")
    public ResponseEntity<ReferenceResponse> createReference(
            @PathVariable UUID tutorId,
            @Valid @RequestBody CreateReferenceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tutorReferenceService.createReference(tutorId, request));
    }

    @GetMapping("/tutors/{tutorId}/references")
    public ResponseEntity<List<ReferenceResponse>> getApprovedReferences(@PathVariable UUID tutorId) {
        return ResponseEntity.ok(tutorReferenceService.getApprovedReferences(tutorId));
    }

    @GetMapping("/tutors/me/references")
    public ResponseEntity<List<ReferenceResponse>> getMyReferences(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw ApiException.unauthorized("Kimlik doğrulaması gerekli");
        }
        UUID tutorId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(tutorReferenceService.getTutorReferences(tutorId));
    }

    @GetMapping("/admin/references")
    public ResponseEntity<List<ReferenceResponse>> getPendingReferences(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw ApiException.unauthorized("Kimlik doğrulaması gerekli");
        }
        return ResponseEntity.ok(tutorReferenceService.getPendingReferences());
    }

    @PutMapping("/admin/references/{referenceId}")
    public ResponseEntity<Void> updateReferenceStatus(
            @PathVariable UUID referenceId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw ApiException.unauthorized("Kimlik doğrulaması gerekli");
        }
        boolean approved = (boolean) body.getOrDefault("approved", false);
        tutorReferenceService.updateReferenceStatus(referenceId, approved);
        return ResponseEntity.ok().build();
    }
}
