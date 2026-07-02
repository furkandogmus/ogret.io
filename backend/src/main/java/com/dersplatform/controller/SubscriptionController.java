package com.dersplatform.controller;

import com.dersplatform.model.dto.response.SubscriptionResponse;
import com.dersplatform.model.enums.SubscriptionPlan;
import com.dersplatform.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/plans")
    public ResponseEntity<List<Map<String, Object>>> getPlans() {
        return ResponseEntity.ok(subscriptionService.getPlans());
    }

    @PostMapping
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<SubscriptionResponse> subscribe(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        SubscriptionPlan plan = SubscriptionPlan.valueOf(body.get("planType"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subscriptionService.subscribe(
                        UUID.fromString(userDetails.getUsername()), plan, body.get("paymentMethod")));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<SubscriptionResponse> getMySubscription(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(subscriptionService.getMySubscription(
                UUID.fromString(userDetails.getUsername())));
    }

    @PostMapping("/cancel")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<Void> cancelSubscription(
            @AuthenticationPrincipal UserDetails userDetails) {
        subscriptionService.cancelSubscription(UUID.fromString(userDetails.getUsername()));
        return ResponseEntity.ok().build();
    }
}
