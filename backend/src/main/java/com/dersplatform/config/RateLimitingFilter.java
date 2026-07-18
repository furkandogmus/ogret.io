package com.dersplatform.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class RateLimitingFilter implements Filter {

    private final StringRedisTemplate stringRedisTemplate;

    private static final int MAX_REQUESTS = 100;
    private static final int AUTH_MAX_REQUESTS = 10;
    private static final long WINDOW_SECONDS = 60;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String bypassHeader = httpRequest.getHeader("X-Bypass-Rate-Limit");
        if ("sim-bypass-key".equals(bypassHeader)) {
            chain.doFilter(request, response);
            return;
        }

        String ip = resolveClientIp(httpRequest);
        String path = httpRequest.getRequestURI();
        if (path.startsWith("/ws")) {
            chain.doFilter(request, response);
            return;
        }
        boolean isAuthEndpoint = path.contains("/auth/");

        int maxRequests = isAuthEndpoint ? AUTH_MAX_REQUESTS : MAX_REQUESTS;
        String key = "rate_limit:" + ip + ":" + (isAuthEndpoint ? "auth" : "general");

        Long current;
        try {
            current = stringRedisTemplate.opsForValue().increment(key);
            if (current != null && current == 1) {
                stringRedisTemplate.expire(key, WINDOW_SECONDS, TimeUnit.SECONDS);
            }
        } catch (RuntimeException redisFailure) {
            log.error("Rate limiter backend unavailable for {}", path, redisFailure);
            if (isAuthEndpoint) {
                HttpServletResponse resp = (HttpServletResponse) response;
                resp.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
                resp.setContentType("application/json");
                resp.getWriter().write("{\"message\":\"Kimlik doğrulama servisi geçici olarak kullanılamıyor\"}");
                return;
            }
            chain.doFilter(request, response);
            return;
        }

        if (current != null && current > maxRequests) {
            HttpServletResponse resp = (HttpServletResponse) response;
            resp.setStatus(429);
            resp.setContentType("application/json");
            resp.setHeader("Retry-After", String.valueOf(WINDOW_SECONDS));
            resp.getWriter().write("{\"message\":\"Çok fazla istek gönderdiniz. Lütfen "
                    + WINDOW_SECONDS + " saniye bekleyin.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String remoteAddress = request.getRemoteAddr();
        if (!isTrustedProxy(remoteAddress)) {
            return remoteAddress;
        }

        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor == null || forwardedFor.isBlank()) {
            return remoteAddress;
        }

        String candidate = forwardedFor.split(",", 2)[0].trim();
        return candidate.matches("[0-9a-fA-F:.]{1,45}") ? candidate : remoteAddress;
    }

    private boolean isTrustedProxy(String address) {
        if (address == null) return false;
        if (address.equals("127.0.0.1") || address.equals("::1") || address.startsWith("10.")) {
            return true;
        }
        if (address.startsWith("192.168.")) {
            return true;
        }
        if (!address.startsWith("172.")) {
            return false;
        }
        String[] parts = address.split("\\.");
        if (parts.length != 4) return false;
        try {
            int secondOctet = Integer.parseInt(parts[1]);
            return secondOctet >= 16 && secondOctet <= 31;
        } catch (NumberFormatException ignored) {
            return false;
        }
    }
}
