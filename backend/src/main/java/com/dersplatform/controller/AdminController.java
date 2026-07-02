package com.dersplatform.controller;

import com.dersplatform.model.dto.response.LessonResponse;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(adminService.getUsers());
    }

    @PutMapping("/users/{id}/verify")
    public ResponseEntity<UserResponse> verifyUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.verifyUser(id));
    }

    @GetMapping("/verifications")
    public ResponseEntity<List<Map<String, Object>>> getVerifications() {
        return ResponseEntity.ok(adminService.getVerifications());
    }

    @PutMapping("/verifications/{id}")
    public ResponseEntity<Void> reviewVerification(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        adminService.reviewVerification(
                id,
                (boolean) body.getOrDefault("approved", false),
                (String) body.get("adminNote"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/lessons")
    public ResponseEntity<List<LessonResponse>> getLessons() {
        return ResponseEntity.ok(adminService.getLessons());
    }
}
