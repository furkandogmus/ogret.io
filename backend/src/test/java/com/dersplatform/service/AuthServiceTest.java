package com.dersplatform.service;

import com.dersplatform.model.dto.request.LoginRequest;
import com.dersplatform.model.dto.request.RegisterRequest;
import com.dersplatform.model.dto.response.AuthResponse;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.UserRepository;
import com.dersplatform.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private EmailService emailService;
    @Mock private StringRedisTemplate stringRedisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;

    private AuthService authService;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, new BCryptPasswordEncoder(), jwtTokenProvider, authenticationManager, emailService, stringRedisTemplate);
        lenient().when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);

        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPhone("+905551234567");
        registerRequest.setPassword("password1234");
        registerRequest.setFullName("Test User");
        registerRequest.setRole(Role.STUDENT);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .phone("+905551234567")
                .passwordHash(new BCryptPasswordEncoder().encode("password1234"))
                .fullName("Test User")
                .role(Role.STUDENT)
                .isVerified(true)
                .isProfileComplete(false)
                .ratingAvg(BigDecimal.ZERO)
                .ratingCount(0)
                .isOnline(false)
                .isIdentityVerified(false)
                .build();
    }

    @Test
    void register_ShouldCreateUnverifiedUserWithoutSessionTokens() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateEmailVerificationToken(any())).thenReturn("verify-token");
        when(jwtTokenProvider.getTokenId("verify-token")).thenReturn("verify-jti");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertNull(response.getAccessToken());
        assertNull(response.getRefreshToken());
        assertNotNull(response.getUser());
        assertEquals("test@example.com", response.getUser().getEmail());
        assertEquals("Test User", response.getUser().getFullName());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ShouldThrow_whenEmailExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_ShouldThrow_whenPhoneExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_ShouldRejectAdminRole() {
        registerRequest.setRole(Role.ADMIN);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);

        assertThrows(com.dersplatform.exception.ApiException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_ShouldReturnTokens() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.generateAccessToken(any(), anyString(), anyString(), anyInt())).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(any(), anyInt())).thenReturn("refresh-token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
    }

    @Test
    void refresh_ShouldReturnNewTokens() {
        String refreshToken = "valid-refresh-token";
        when(jwtTokenProvider.validateRefreshToken(refreshToken)).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromRefreshToken(refreshToken)).thenReturn(testUser.getId());
        when(jwtTokenProvider.getTokenVersion(refreshToken)).thenReturn(0);
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.generateAccessToken(any(), anyString(), anyString(), anyInt())).thenReturn("new-access-token");
        when(jwtTokenProvider.generateRefreshToken(any(), anyInt())).thenReturn("new-refresh-token");

        var request = new com.dersplatform.model.dto.request.RefreshTokenRequest();
        request.setRefreshToken(refreshToken);

        AuthResponse response = authService.refresh(request);

        assertEquals("new-access-token", response.getAccessToken());
        assertEquals("new-refresh-token", response.getRefreshToken());
    }

    @Test
    void login_ShouldLockOnlyAfterFifthFailedAttempt() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(valueOperations.increment("auth:login:attempts:test@example.com")).thenReturn(5L);

        assertThrows(com.dersplatform.exception.ApiException.class, () -> authService.login(loginRequest));

        verify(valueOperations).set(
                "auth:login:lock:test@example.com", "locked", 15L, java.util.concurrent.TimeUnit.MINUTES);
        verify(stringRedisTemplate).delete("auth:login:attempts:test@example.com");
    }

    @Test
    void login_ShouldRejectLockedAccountBeforeAuthentication() {
        when(stringRedisTemplate.hasKey("auth:login:lock:test@example.com")).thenReturn(true);
        when(stringRedisTemplate.getExpire("auth:login:lock:test@example.com", java.util.concurrent.TimeUnit.SECONDS))
                .thenReturn(120L);

        var exception = assertThrows(
                com.dersplatform.exception.ApiException.class,
                () -> authService.login(loginRequest));

        assertEquals(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS, exception.getStatus());
        verifyNoInteractions(authenticationManager);
    }

    @Test
    void verifyEmail_ShouldConsumeSingleUseToken() {
        testUser.setVerified(false);
        String token = "verification-token";
        when(jwtTokenProvider.getUserIdFromEmailVerificationToken(token)).thenReturn(testUser.getId());
        when(jwtTokenProvider.getTokenId(token)).thenReturn("verification-jti");
        when(valueOperations.getAndDelete("auth:verify:verification-jti"))
                .thenReturn(testUser.getId().toString())
                .thenReturn(null);
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        var request = new com.dersplatform.model.dto.request.VerifyEmailRequest(token);

        authService.verifyEmail(request);
        assertTrue(testUser.isVerified());

        assertThrows(com.dersplatform.exception.ApiException.class, () -> authService.verifyEmail(request));
    }

    @Test
    void resetPassword_ShouldConsumeTokenAndInvalidateSessions() {
        String token = "reset-token";
        when(jwtTokenProvider.getUserIdFromPasswordResetToken(token)).thenReturn(testUser.getId());
        when(jwtTokenProvider.getTokenId(token)).thenReturn("reset-jti");
        when(valueOperations.getAndDelete("auth:reset:reset-jti")).thenReturn(testUser.getId().toString());
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

        authService.resetPassword(token, "a-new-password-123");

        assertEquals(1, testUser.getTokenVersion());
        verify(userRepository).save(testUser);
    }
}
