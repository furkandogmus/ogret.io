package com.dersplatform.controller;

import com.dersplatform.model.dto.request.LoginRequest;
import com.dersplatform.model.dto.request.RefreshTokenRequest;
import com.dersplatform.model.dto.request.RegisterRequest;
import com.dersplatform.model.dto.response.AuthResponse;
import com.dersplatform.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestBody Map<String, String> body) {
        authService.verifyEmail(body.get("token"));
        return ResponseEntity.ok(Map.of("message", "E-posta başarıyla doğrulandı"));
    }

    @PostMapping("/verify-phone")
    public ResponseEntity<Map<String, String>> verifyPhone(@RequestBody Map<String, String> body) {
        authService.verifyPhone(body.get("code"));
        return ResponseEntity.ok(Map.of("message", "Telefon başarıyla doğrulandı"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        authService.forgotPassword(body.get("email"));
        return ResponseEntity.ok(Map.of("message", "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("token"), body.get("password"));
        return ResponseEntity.ok(Map.of("message", "Şifreniz başarıyla sıfırlandı"));
    }
}
