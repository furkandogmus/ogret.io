package com.dersplatform.security;

import com.dersplatform.model.dto.response.AuthResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Arrays;

@Component
public class AuthCookieService {

    public static final String ACCESS_COOKIE = "ogret_access";
    public static final String REFRESH_COOKIE = "ogret_refresh";
    public static final String MOBILE_CLIENT_HEADER = "X-Client-Platform";

    private final boolean secure;
    private final Duration accessTtl;
    private final Duration refreshTtl;

    public AuthCookieService(
            @Value("${app.auth.cookie-secure:false}") boolean secure,
            @Value("${app.jwt.access-token-expiration}") long accessTtlMillis,
            @Value("${app.jwt.refresh-token-expiration}") long refreshTtlMillis) {
        this.secure = secure;
        this.accessTtl = Duration.ofMillis(accessTtlMillis);
        this.refreshTtl = Duration.ofMillis(refreshTtlMillis);
    }

    public boolean isMobileClient(HttpServletRequest request) {
        return "mobile".equalsIgnoreCase(request.getHeader(MOBILE_CLIENT_HEADER));
    }

    public void writeAuthCookies(HttpServletResponse response, AuthResponse auth) {
        addCookie(response, ACCESS_COOKIE, auth.getAccessToken(), "/", accessTtl);
        addCookie(response, REFRESH_COOKIE, auth.getRefreshToken(), "/api/v1/auth", refreshTtl);
    }

    public void clearAuthCookies(HttpServletResponse response) {
        addCookie(response, ACCESS_COOKIE, "", "/", Duration.ZERO);
        addCookie(response, REFRESH_COOKIE, "", "/api/v1/auth", Duration.ZERO);
    }

    public String readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        return Arrays.stream(cookies)
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private void addCookie(HttpServletResponse response, String name, String value, String path, Duration maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path(path)
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
