package com.dersplatform.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RateLimitingFilterTest {

    private StringRedisTemplate redisTemplate;
    private ValueOperations<String, String> valueOperations;
    private RateLimitingFilter filter;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        redisTemplate = mock(StringRedisTemplate.class);
        valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(org.mockito.ArgumentMatchers.anyString())).thenReturn(1L);
        filter = new RateLimitingFilter(redisTemplate);
    }

    @Test
    void usesForwardedClientAddressFromTrustedReverseProxy() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/subjects");
        request.setRemoteAddr("192.168.100.12");
        request.addHeader("X-Forwarded-For", "203.0.113.27, 192.168.100.12");

        filter.doFilter(request, new MockHttpServletResponse(), mock(FilterChain.class));

        verify(valueOperations).increment("rate_limit:203.0.113.27:general");
    }

    @Test
    void ignoresSpoofedForwardedAddressFromUntrustedClient() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("198.51.100.19");
        request.addHeader("X-Forwarded-For", "203.0.113.27");

        filter.doFilter(request, new MockHttpServletResponse(), mock(FilterChain.class));

        verify(valueOperations).increment("rate_limit:198.51.100.19:auth");
    }
}
