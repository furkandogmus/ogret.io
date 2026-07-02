package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.LoginRequest;
import com.dersplatform.model.dto.request.RefreshTokenRequest;
import com.dersplatform.model.dto.request.RegisterRequest;
import com.dersplatform.model.dto.response.AuthResponse;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.UserRepository;
import com.dersplatform.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw ApiException.conflict("Bu e-posta adresi zaten kayıtlı");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw ApiException.conflict("Bu telefon numarası zaten kayıtlı");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.STUDENT;

        User user = User.builder()
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .isVerified(false)
                .isProfileComplete(false)
                .ratingAvg(java.math.BigDecimal.ZERO)
                .ratingCount(0)
                .isOnline(false)
                .isIdentityVerified(false)
                .build();

        user = userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(900000)
                .user(UserResponse.fromEntity(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> ApiException.unauthorized("E-posta veya şifre hatalı"))
                                .getId().toString(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> ApiException.unauthorized("E-posta veya şifre hatalı"));

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(900000)
                .user(UserResponse.fromEntity(user))
                .build();
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw ApiException.unauthorized("Geçersiz refresh token");
        }

        var userId = jwtTokenProvider.getUserIdFromToken(request.getRefreshToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(900000)
                .user(UserResponse.fromEntity(user))
                .build();
    }

    @Transactional
    public void verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw ApiException.badRequest("Doğrulama token'ı gerekli");
        }
        UUID userId = jwtTokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        user.setVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void verifyPhone(String code) {
        if (code == null || code.isBlank()) {
            throw ApiException.badRequest("Doğrulama kodu gerekli");
        }
        throw ApiException.badRequest("SMS doğrulama henüz yapılandırılmadı");
    }

    @Transactional
    public void forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw ApiException.badRequest("E-posta adresi gerekli");
        }
        userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("Bu e-posta ile kayıtlı kullanıcı bulunamadı"));
    }

    @Transactional
    public void resetPassword(String token, String password) {
        if (token == null || password == null || token.isBlank() || password.isBlank()) {
            throw ApiException.badRequest("Token ve yeni şifre gerekli");
        }
        UUID userId = jwtTokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);
    }
}
