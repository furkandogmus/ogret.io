package com.dersplatform.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(1)
public class RateLimitingFilter implements Filter {

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 100;
    private static final long WINDOW_MS = 60_000;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        String ip = request.getRemoteAddr();
        Window window = windows.computeIfAbsent(ip, k -> new Window());

        synchronized (window) {
            long now = System.currentTimeMillis();
            if (now - window.start > WINDOW_MS) {
                window.start = now;
                window.count.set(1);
            } else if (window.count.incrementAndGet() > MAX_REQUESTS) {
                HttpServletResponse resp = (HttpServletResponse) response;
                resp.setStatus(429);
                resp.setContentType("application/json");
                resp.getWriter().write("{\"message\":\"Çok fazla istek gönderdiniz. Lütfen bekleyin.\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private static class Window {
        long start = System.currentTimeMillis();
        AtomicInteger count = new AtomicInteger(0);
    }
}
