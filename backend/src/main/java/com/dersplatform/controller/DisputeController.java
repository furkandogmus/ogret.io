package com.dersplatform.controller;

import com.dersplatform.model.entity.Dispute;
import com.dersplatform.model.entity.DisputeMessage;
import com.dersplatform.service.DisputeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping("/disputes")
    public ResponseEntity<Dispute> createDispute(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        UUID lessonId = UUID.fromString((String) body.get("lessonId"));
        return ResponseEntity.ok(disputeService.createDispute(
                userId, lessonId,
                (String) body.get("subject"),
                (String) body.get("description")));
    }

    @GetMapping("/disputes")
    public ResponseEntity<Page<Dispute>> getMyDisputes(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(disputeService.getMyDisputes(userId, pageable));
    }

    @GetMapping("/disputes/against-me")
    public ResponseEntity<Page<Dispute>> getDisputesAgainstMe(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(disputeService.getDisputesAgainstMe(userId, pageable));
    }

    @GetMapping("/disputes/{id}")
    public ResponseEntity<Dispute> getDispute(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(disputeService.getDispute(id, userId));
    }

    @GetMapping("/disputes/{id}/messages")
    public ResponseEntity<List<DisputeMessage>> getMessages(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(disputeService.getMessages(id, userId));
    }

    @PostMapping("/disputes/{id}/messages")
    public ResponseEntity<DisputeMessage> addMessage(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(disputeService.addMessage(id, userId, body.get("message")));
    }

    @PutMapping("/admin/disputes/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Dispute> resolveDispute(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        UUID adminId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(disputeService.resolveDispute(id, adminId, body.get("resolutionNotes")));
    }

    @GetMapping("/admin/disputes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Dispute>> getAllDisputes(
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(disputeService.getAllDisputes(status, pageable));
    }
}
