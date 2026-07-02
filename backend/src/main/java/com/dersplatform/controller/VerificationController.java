package com.dersplatform.controller;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.entity.TutorVerification;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.VerificationStatus;
import com.dersplatform.repository.TutorVerificationRepository;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/verifications")
@RequiredArgsConstructor
public class VerificationController {

    private final TutorVerificationRepository tutorVerificationRepository;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<Map<String, Object>> submitVerification(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        User tutor = userRepository.findById(UUID.fromString(userDetails.getUsername()))
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        TutorVerification verification = TutorVerification.builder()
                .tutor(tutor)
                .documentType(body.get("documentType"))
                .documentUrl(body.get("documentUrl"))
                .status(VerificationStatus.PENDING)
                .build();

        verification = tutorVerificationRepository.save(verification);

        return ResponseEntity.ok(Map.of(
                "id", verification.getId().toString(),
                "status", verification.getStatus().name()
        ));
    }
}
