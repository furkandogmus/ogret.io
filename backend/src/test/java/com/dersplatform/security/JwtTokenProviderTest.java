package com.dersplatform.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(
                "test-jwt-secret-key-that-is-at-least-256-bits-long-for-testing-purposes",
                900000,
                604800000
        );
    }

    @Test
    void generateAccessToken_ShouldCreateValidToken() {
        UUID userId = UUID.randomUUID();
        String token = tokenProvider.generateAccessToken(userId, "test@example.com", "STUDENT");

        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(userId, tokenProvider.getUserIdFromToken(token));
    }

    @Test
    void generateRefreshToken_ShouldCreateValidToken() {
        UUID userId = UUID.randomUUID();
        String token = tokenProvider.generateRefreshToken(userId);

        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(userId, tokenProvider.getUserIdFromToken(token));
    }

    @Test
    void validateToken_ShouldReturnFalse_forInvalidToken() {
        assertFalse(tokenProvider.validateToken("invalid-token"));
    }

    @Test
    void validateToken_ShouldReturnFalse_forExpiredToken() {
        var shortLived = new JwtTokenProvider(
                "test-jwt-secret-key-that-is-at-least-256-bits-long-for-testing-purposes",
                -1,
                -1
        );
        String token = shortLived.generateAccessToken(UUID.randomUUID(), "test@example.com", "STUDENT");

        assertFalse(shortLived.validateToken(token));
    }

    @Test
    void tokens_ShouldHaveDifferentValues() {
        UUID userId = UUID.randomUUID();
        String accessToken = tokenProvider.generateAccessToken(userId, "test@example.com", "STUDENT");
        String refreshToken = tokenProvider.generateRefreshToken(userId);

        assertNotEquals(accessToken, refreshToken);
    }
}
