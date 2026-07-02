package com.dersplatform.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Iterator;
import java.util.Map;
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
        long now = System.currentTimeMillis();

        Window window = windows.compute(ip, (key, existing) -> {
            if (existing == null || now - existing.start > WINDOW_MS) {
                return new Window(now);
            }
            return existing;
        });

        int count = window.count.incrementAndGet();
        if (count > MAX_REQUESTS) {
            HttpServletResponse resp = (HttpServletResponse) response;
            resp.setStatus(429);
            resp.setContentType("application/json");
            resp.getWriter().write("{\"message\":\"Çok fazla istek gönderdiniz. Lütfen bekleyin.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    @Scheduled(fixedRate = 60_000)
    public void evictStaleWindows() {
        long now = System.currentTimeMillis();
        Iterator<Map.Entry<String, Window>> it = windows.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, Window> entry = it.next();
            if (now - entry.getValue().start > WINDOW_MS * 2) {
                it.remove();
            }
        }
    }

    private static class Window {
        final long start;
        final AtomicInteger count;

        Window(long start) {
            this.start = start;
            this.count = new AtomicInteger(0);
        }
    }
}
