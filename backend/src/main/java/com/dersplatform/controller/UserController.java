package com.dersplatform.controller;

import com.dersplatform.model.dto.request.ChangePasswordRequest;
import com.dersplatform.model.dto.request.UpdateProfileRequest;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.service.UserService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(UUID.fromString(userDetails.getUsername())));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(UUID.fromString(userDetails.getUsername()), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Şifre başarıyla değiştirildi"));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(UUID.fromString(userDetails.getUsername()), request));
    }

    @PutMapping("/me/avatar")
    public ResponseEntity<UserResponse> updateAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.updateAvatar(UUID.fromString(userDetails.getUsername()), body.get("avatarUrl")));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> searchUsers(
            @RequestParam(required = false) String q,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.searchUsers(q, UUID.fromString(userDetails.getUsername())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
