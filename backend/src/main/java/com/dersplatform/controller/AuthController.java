package com.dersplatform.controller;

import com.dersplatform.model.dto.request.ForgotPasswordRequest;
import com.dersplatform.model.dto.request.LoginRequest;
import com.dersplatform.model.dto.request.RefreshTokenRequest;
import com.dersplatform.model.dto.request.RegisterRequest;
import com.dersplatform.model.dto.request.ResetPasswordRequest;
import com.dersplatform.model.dto.request.VerifyEmailRequest;
import com.dersplatform.model.dto.response.AuthResponse;
import com.dersplatform.service.AuthService;
import com.dersplatform.security.AuthCookieService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    private final AuthCookieService authCookieService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        AuthResponse auth = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(prepareClientResponse(auth, httpRequest, httpResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        AuthResponse auth = authService.login(request);
        return ResponseEntity.ok(prepareClientResponse(auth, httpRequest, httpResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        String refreshToken = request != null ? request.getRefreshToken() : null;
        if (refreshToken == null || refreshToken.isBlank()) {
            refreshToken = authCookieService.readCookie(httpRequest, AuthCookieService.REFRESH_COOKIE);
        }
        RefreshTokenRequest resolvedRequest = new RefreshTokenRequest();
        resolvedRequest.setRefreshToken(refreshToken);
        AuthResponse auth = authService.refresh(resolvedRequest);
        return ResponseEntity.ok(prepareClientResponse(auth, httpRequest, httpResponse));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok(Map.of("message", "E-posta başarıyla doğrulandı"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        boolean deliveryEnabled = authService.isEmailDeliveryEnabled();
        return ResponseEntity.ok(Map.of(
                "deliveryEnabled", deliveryEnabled,
                "message", deliveryEnabled
                        ? "Hesap mevcutsa şifre sıfırlama bağlantısı e-posta adresine gönderildi"
                        : "E-posta servisi bu kurulumda kapalı; yöneticiniz geçici şifre belirleyebilir"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.resendVerification(request.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "Hesap doğrulanmamışsa yeni doğrulama bağlantısı gönderildi"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok(Map.of("message", "Şifreniz başarıyla sıfırlandı"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request,
            HttpServletResponse response) {
        String refreshToken = body != null ? body.get("refreshToken") : null;
        if (refreshToken == null || refreshToken.isBlank()) {
            refreshToken = authCookieService.readCookie(request, AuthCookieService.REFRESH_COOKIE);
        }
        authService.logout(refreshToken);
        authCookieService.clearAuthCookies(response);
        return ResponseEntity.ok(Map.of("message", "Başarıyla çıkış yapıldı"));
    }

    private AuthResponse prepareClientResponse(
            AuthResponse auth,
            HttpServletRequest request,
            HttpServletResponse response) {
        if (authCookieService.isMobileClient(request)) {
            return auth;
        }
        if (auth.getAccessToken() == null || auth.getRefreshToken() == null) {
            return auth;
        }
        authCookieService.writeAuthCookies(response, auth);
        return auth.withoutTokens();
    }
}
