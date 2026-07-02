package com.dersplatform.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private final SecretKey accessSecretKey;
    private final SecretKey refreshSecretKey;
    private final SecretKey passwordResetSecretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;
    private static final long PASSWORD_RESET_EXPIRATION = 900_000;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiration}") long accessExpiration,
            @Value("${app.jwt.refresh-token-expiration}") long refreshExpiration) {
        this.accessSecretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.refreshSecretKey = Keys.hmacShaKeyFor((secret + "-refresh").getBytes(StandardCharsets.UTF_8));
        this.passwordResetSecretKey = Keys.hmacShaKeyFor((secret + "-password-reset").getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessExpiration;
        this.refreshTokenExpiration = refreshExpiration;
    }

    public String generateAccessToken(UUID userId, String email, String role) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(accessSecretKey)
                .compact();
    }

    public String generateRefreshToken(UUID userId) {
        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(refreshSecretKey)
                .compact();
    }

    public String generatePasswordResetToken(UUID userId) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("purpose", "password_reset")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + PASSWORD_RESET_EXPIRATION))
                .signWith(passwordResetSecretKey)
                .compact();
    }

    public UUID getUserIdFromToken(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public UUID getUserIdFromRefreshToken(String token) {
        return UUID.fromString(parseClaims(token, refreshSecretKey).getSubject());
    }

    public UUID getUserIdFromPasswordResetToken(String token) {
        Claims claims = parseClaims(token, passwordResetSecretKey);
        if (!"password_reset".equals(claims.get("purpose"))) {
            throw new JwtException("Geçersiz token amacı");
        }
        return UUID.fromString(claims.getSubject());
    }

    public boolean validateToken(String token) {
        return validateTokenWithKey(token, accessSecretKey);
    }

    public boolean validateRefreshToken(String token) {
        return validateTokenWithKey(token, refreshSecretKey);
    }

    private boolean validateTokenWithKey(String token, SecretKey key) {
        try {
            parseClaims(token, key);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return parseClaims(token, accessSecretKey);
    }

    private Claims parseClaims(String token, SecretKey key) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
