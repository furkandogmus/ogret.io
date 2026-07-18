package com.dersplatform.controller;

import com.dersplatform.model.dto.request.UpdateEmailVerificationRequest;
import com.dersplatform.model.dto.request.UpdateTemporaryPasswordRequest;
import com.dersplatform.model.dto.request.ReviewVerificationRequest;
import com.dersplatform.model.dto.response.AdminDashboardResponse;
import com.dersplatform.model.dto.response.AdminUserResponse;
import com.dersplatform.model.dto.response.LessonResponse;
import com.dersplatform.model.dto.response.PageResponse;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.model.enums.Role;
import com.dersplatform.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/users")
    public ResponseEntity<PageResponse<AdminUserResponse>> getUsers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) Boolean profileComplete,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AdminUserResponse> users = adminService.getUsers(q, role, verified, profileComplete, pageable);
        return ResponseEntity.ok(PageResponse.<AdminUserResponse>builder()
                .content(users.getContent())
                .page(users.getNumber())
                .size(users.getSize())
                .totalElements(users.getTotalElements())
                .totalPages(users.getTotalPages())
                .first(users.isFirst())
                .last(users.isLast())
                .build());
    }

    @PutMapping("/users/{id}/verify")
    public ResponseEntity<UserResponse> verifyUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.verifyUser(id));
    }

    @PatchMapping("/users/{id}/email-verification")
    public ResponseEntity<AdminUserResponse> updateEmailVerification(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEmailVerificationRequest request) {
        return ResponseEntity.ok(adminService.updateEmailVerification(id, request.getVerified()));
    }

    @PutMapping("/users/{id}/temporary-password")
    public ResponseEntity<Void> setTemporaryPassword(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTemporaryPasswordRequest request) {
        adminService.setTemporaryPassword(id, request.getTemporaryPassword());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/verifications")
    public ResponseEntity<List<Map<String, Object>>> getVerifications() {
        return ResponseEntity.ok(adminService.getVerifications());
    }

    @PutMapping("/verifications/{id}")
    public ResponseEntity<Void> reviewVerification(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewVerificationRequest request) {
        adminService.reviewVerification(
                id,
                request.isApproved(),
                request.getAdminNote());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/lessons")
    public ResponseEntity<Page<LessonResponse>> getLessons(Pageable pageable) {
        return ResponseEntity.ok(adminService.getLessons(pageable));
    }
}
