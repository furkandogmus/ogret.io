package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.LoginRequest;
import com.dersplatform.model.dto.request.RefreshTokenRequest;
import com.dersplatform.model.dto.request.RegisterRequest;
import com.dersplatform.model.dto.request.VerifyEmailRequest;
import com.dersplatform.model.dto.response.AuthResponse;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.UserRepository;
import com.dersplatform.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final StringRedisTemplate stringRedisTemplate;
    private final ProfileCompletionService profileCompletionService;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Value("${app.email.fail-fast:false}")
    private boolean emailFailFast;

    private static final long ACCESS_TOKEN_TTL = 900000;
    private static final long LOCKOUT_DURATION_MINUTES = 15;
    private static final long ATTEMPT_WINDOW_MINUTES = 15;
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long EMAIL_VERIFICATION_TTL_HOURS = 24;
    private static final long PASSWORD_RESET_TTL_MINUTES = 15;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(java.util.Locale.ROOT);
        String normalizedPhone = request.getPhone().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw ApiException.conflict("Bu e-posta adresi zaten kayıtlı");
        }
        if (userRepository.existsByPhone(normalizedPhone)) {
            throw ApiException.conflict("Bu telefon numarası zaten kayıtlı");
        }

        Role role = request.getRole();
        if (role != Role.STUDENT && role != Role.TUTOR) {
            throw ApiException.forbidden("Public kayıt yalnızca öğrenci veya öğretmen rolüyle yapılabilir");
        }

        User user = User.builder()
                .email(normalizedEmail)
                .phone(normalizedPhone)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role(role)
                .isVerified(true)
                .tokenVersion(0)
                .isProfileComplete(false)
                .ratingAvg(java.math.BigDecimal.ZERO)
                .ratingCount(0)
                .isOnline(false)
                .isIdentityVerified(false)
                .build();

        // Flush the INSERT before profile completion mutates the same entity.
        // UUIDs are generated on persist while @CreationTimestamp is assigned
        // on flush; a second save in between can otherwise be treated as a
        // merge and issue an UPDATE with created_at still null.
        user = userRepository.saveAndFlush(user);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(java.util.Locale.ROOT);
        String attemptKey = "auth:login:attempts:" + normalizedEmail;
        String lockoutKey = "auth:login:lock:" + normalizedEmail;

        if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(lockoutKey))) {
            Long ttl = stringRedisTemplate.getExpire(lockoutKey, TimeUnit.SECONDS);
            throw ApiException.tooManyRequests(
                    "Hesap geçici olarak kilitlendi. " + (ttl != null ? ttl : 0) + " saniye sonra tekrar deneyin.");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> {
                    recordFailedAttempt(attemptKey, lockoutKey);
                    return ApiException.unauthorized("E-posta veya şifre hatalı");
                });

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getId().toString(),
                            request.getPassword()));
        } catch (Exception e) {
            recordFailedAttempt(attemptKey, lockoutKey);
            throw ApiException.unauthorized("E-posta veya şifre hatalı");
        }

        stringRedisTemplate.delete(attemptKey);
        stringRedisTemplate.delete(lockoutKey);

        user.setLastActiveAt(LocalDateTime.now());
        user.setOnline(true);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        if (isTokenBlacklisted(token)) {
            throw ApiException.unauthorized("Token geçersiz (iptal edilmiş)");
        }

        if (!jwtTokenProvider.validateRefreshToken(token)) {
            throw ApiException.unauthorized("Geçersiz refresh token");
        }

        var userId = jwtTokenProvider.getUserIdFromRefreshToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        if (jwtTokenProvider.getTokenVersion(token) != tokenVersion(user)) {
            throw ApiException.unauthorized("Oturum geçersiz veya süresi dolmuş");
        }

        addToBlacklist(token, 7 * 24 * 60 * 60);

        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            addToBlacklist(refreshToken, 7 * 24 * 60 * 60);
        }
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            throw ApiException.badRequest("Doğrulama token'ı gerekli");
        }
        UUID userId;
        String jti;
        try {
            userId = jwtTokenProvider.getUserIdFromEmailVerificationToken(request.getToken());
            jti = jwtTokenProvider.getTokenId(request.getToken());
        } catch (Exception e) {
            throw ApiException.badRequest("Doğrulama bağlantısı geçersiz veya süresi dolmuş");
        }
        String verificationUserId = jti == null
                ? null
                : stringRedisTemplate.opsForValue().getAndDelete("auth:verify:" + jti);
        if (!userId.toString().equals(verificationUserId)) {
            throw ApiException.badRequest("Doğrulama bağlantısı daha önce kullanılmış veya süresi dolmuş");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        user.setVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw ApiException.badRequest("E-posta adresi gerekli");
        }

        // Zero-config/self-host installations intentionally run without a mail
        // provider. Avoid creating an unusable reset token in that mode; an
        // administrator can set a temporary password from the admin panel.
        if (!emailService.isEnabled()) {
            return;
        }

        var userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();
        String resetToken = jwtTokenProvider.generatePasswordResetToken(user.getId());
        String resetJti = jwtTokenProvider.getTokenId(resetToken);
        stringRedisTemplate.opsForValue().set(
                "auth:reset:" + resetJti,
                user.getId().toString(),
                PASSWORD_RESET_TTL_MINUTES,
                TimeUnit.MINUTES);
        String resetLink = baseUrl + "/sifre-sifirla?token=" + resetToken;

        try {
            emailService.send(
                    user.getEmail(),
                    "Şifre Sıfırlama - öğret.io",
                    "Merhaba " + user.getFullName() + ",\n\n"
                            + "Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n"
                            + resetLink + "\n\n"
                            + "Bu bağlantı 15 dakika süreyle geçerlidir.\n"
                            + "Eğer şifre sıfırlama talebinde bulunmadıysanız bu e-postayı dikkate almayın.\n\n"
                            + "öğret.io");
        } catch (Exception e) {
            log.error("Password reset email could not be sent to {}", user.getEmail(), e);
            throw ApiException.internalServerError("Şifre sıfırlama e-postası gönderilemedi");
        }
    }

    public boolean isEmailDeliveryEnabled() {
        return emailService.isEnabled();
    }

    public void resendVerification(String email) {
        if (email == null || email.isBlank()) {
            throw ApiException.badRequest("E-posta adresi gerekli");
        }
        if (!emailService.isEnabled()) {
            return;
        }
        userRepository.findByEmail(email.trim().toLowerCase(java.util.Locale.ROOT))
                .filter(user -> !user.isVerified())
                .ifPresent(this::sendVerificationEmail);
    }

    @Transactional
    public void resetPassword(String token, String password) {
        if (token == null || password == null || token.isBlank() || password.isBlank()) {
            throw ApiException.badRequest("Token ve yeni şifre gerekli");
        }
        UUID userId;
        String jti;
        try {
            userId = jwtTokenProvider.getUserIdFromPasswordResetToken(token);
            jti = jwtTokenProvider.getTokenId(token);
        } catch (Exception e) {
            throw ApiException.badRequest("Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş");
        }
        String resetUserId = jti == null
                ? null
                : stringRedisTemplate.opsForValue().getAndDelete("auth:reset:" + jti);
        if (!userId.toString().equals(resetUserId)) {
            throw ApiException.badRequest("Şifre sıfırlama bağlantısı daha önce kullanılmış veya süresi dolmuş");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setTokenVersion(tokenVersion(user) + 1);
        userRepository.save(user);
    }

    private void recordFailedAttempt(String attemptKey, String lockoutKey) {
        Long attempts = stringRedisTemplate.opsForValue().increment(attemptKey);
        if (attempts != null && attempts == 1) {
            stringRedisTemplate.expire(attemptKey, ATTEMPT_WINDOW_MINUTES, TimeUnit.MINUTES);
        }
        if (attempts != null && attempts >= MAX_FAILED_ATTEMPTS) {
            stringRedisTemplate.opsForValue().set(
                    lockoutKey, "locked", LOCKOUT_DURATION_MINUTES, TimeUnit.MINUTES);
            stringRedisTemplate.delete(attemptKey);
        }
    }

    private void addToBlacklist(String token, long ttlSeconds) {
        String jti = jwtTokenProvider.getTokenId(token);
        if (jti != null) {
            stringRedisTemplate.opsForValue().set("blacklist:" + jti, "true", ttlSeconds, TimeUnit.SECONDS);
        }
    }

    public boolean isTokenBlacklisted(String token) {
        String jti = jwtTokenProvider.getTokenId(token);
        if (jti == null)
            return false;
        return Boolean.TRUE.equals(stringRedisTemplate.hasKey("blacklist:" + jti));
    }

    private AuthResponse buildAuthResponse(User user) {
        var completion = profileCompletionService.refresh(user);
        int tokenVersion = tokenVersion(user);
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name(), tokenVersion);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), tokenVersion);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(ACCESS_TOKEN_TTL)
                .user(UserResponse.fromEntity(user, completion))
                .build();
    }

    private int tokenVersion(User user) {
        return user.getTokenVersion() == null ? 0 : user.getTokenVersion();
    }

    private void sendVerificationEmail(User user) {
        try {
            String verifyToken = jwtTokenProvider.generateEmailVerificationToken(user.getId());
            String verificationJti = jwtTokenProvider.getTokenId(verifyToken);
            stringRedisTemplate.opsForValue().set(
                    "auth:verify:" + verificationJti,
                    user.getId().toString(),
                    EMAIL_VERIFICATION_TTL_HOURS,
                    TimeUnit.HOURS);
            String verifyLink = baseUrl + "/email-dogrula?token=" + verifyToken;
            emailService.send(
                    user.getEmail(),
                    "E-posta Doğrulama - öğret.io",
                    "Merhaba " + user.getFullName() + ",\n\n"
                            + "E-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:\n"
                            + verifyLink + "\n\n"
                            + "Bu bağlantı 24 saat süreyle ve yalnızca bir kez kullanılabilir.\n\n"
                            + "öğret.io");
        } catch (Exception e) {
            log.error("Verification email could not be sent to {}", user.getEmail(), e);
            if (emailFailFast) {
                throw ApiException.internalServerError("Doğrulama e-postası gönderilemedi");
            }
        }
    }
}
