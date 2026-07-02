package com.dersplatform.controller;

import com.dersplatform.model.entity.LegalAgreement;
import com.dersplatform.service.LegalService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/legal")
@RequiredArgsConstructor
public class LegalController {

    private final LegalService legalService;

    @GetMapping("/agreements")
    public ResponseEntity<List<LegalAgreement>> getActiveAgreements() {
        return ResponseEntity.ok(legalService.getActiveAgreements());
    }

    @GetMapping("/agreements/{slug}")
    public ResponseEntity<LegalAgreement> getAgreement(@PathVariable String slug) {
        return ResponseEntity.ok(legalService.getAgreementBySlug(slug));
    }

    @GetMapping("/acceptances")
    public ResponseEntity<Map<String, Boolean>> getUserAcceptances(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(legalService.getUserAcceptances(userId));
    }

    @PostMapping("/agreements/{slug}/accept")
    public ResponseEntity<Void> acceptAgreement(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String slug,
            HttpServletRequest request) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        legalService.acceptAgreement(userId, slug, request);
        return ResponseEntity.ok().build();
    }
}
