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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    private static final long ACCESS_TOKEN_TTL = 900000;

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

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> ApiException.unauthorized("E-posta veya şifre hatalı"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getId().toString(),
                        request.getPassword()
                )
        );

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        if (!jwtTokenProvider.validateRefreshToken(request.getRefreshToken())) {
            throw ApiException.unauthorized("Geçersiz refresh token");
        }

        var userId = jwtTokenProvider.getUserIdFromRefreshToken(request.getRefreshToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        return buildAuthResponse(user);
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            throw ApiException.badRequest("Doğrulama token'ı gerekli");
        }
        UUID userId = jwtTokenProvider.getUserIdFromToken(request.getToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        user.setVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void verifyPhone(VerifyPhoneRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw ApiException.badRequest("Doğrulama kodu gerekli");
        }
        throw ApiException.badRequest("SMS doğrulama henüz yapılandırılmadı");
    }

    @Transactional
    public void forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw ApiException.badRequest("E-posta adresi gerekli");
        }
        var userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();
        String resetToken = jwtTokenProvider.generatePasswordResetToken(user.getId());
        String resetLink = baseUrl + "/sifre-sifirla?token=" + resetToken;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Şifre Sıfırlama - öğret.io");
            message.setText(
                    "Merhaba " + user.getFullName() + ",\n\n"
                    + "Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n"
                    + resetLink + "\n\n"
                    + "Bu bağlantı 15 dakika süreyle geçerlidir.\n"
                    + "Eğer şifre sıfırlama talebinde bulunmadıysanız bu e-postayı dikkate almayın.\n\n"
                    + "öğret.io"
            );
            mailSender.send(message);
        } catch (Exception e) {
            throw ApiException.internalServerError("Şifre sıfırlama e-postası gönderilemedi");
        }
    }

    @Transactional
    public void resetPassword(String token, String password) {
        if (token == null || password == null || token.isBlank() || password.isBlank()) {
            throw ApiException.badRequest("Token ve yeni şifre gerekli");
        }
        UUID userId = jwtTokenProvider.getUserIdFromPasswordResetToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(ACCESS_TOKEN_TTL)
                .user(UserResponse.fromEntity(user))
                .build();
    }
}
