package com.dersplatform.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
@Order(1)
@RequiredArgsConstructor
public class RateLimitingFilter implements Filter {

    private final StringRedisTemplate stringRedisTemplate;

    private static final int MAX_REQUESTS = 100;
    private static final int AUTH_MAX_REQUESTS = 10;
    private static final long WINDOW_SECONDS = 60;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String ip = request.getRemoteAddr();
        String path = httpRequest.getRequestURI();
        boolean isAuthEndpoint = path.contains("/auth/");

        int maxRequests = isAuthEndpoint ? AUTH_MAX_REQUESTS : MAX_REQUESTS;
        String key = "rate_limit:" + ip + ":" + (isAuthEndpoint ? "auth" : "general");

        Long current = stringRedisTemplate.opsForValue().increment(key);
        if (current != null && current == 1) {
            stringRedisTemplate.expire(key, WINDOW_SECONDS, TimeUnit.SECONDS);
        }

        if (current != null && current > maxRequests) {
            HttpServletResponse resp = (HttpServletResponse) response;
            resp.setStatus(429);
            resp.setContentType("application/json");
            resp.setHeader("Retry-After", String.valueOf(WINDOW_SECONDS));
            resp.getWriter().write("{\"message\":\"Çok fazla istek gönderdiniz. Lütfen \" + WINDOW_SECONDS + \" saniye bekleyin.\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}
