package com.dersplatform.config;

import com.dersplatform.security.AuthCookieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class WebSocketCookieHandshakeInterceptor implements HandshakeInterceptor {

    static final String ACCESS_TOKEN_ATTRIBUTE = "ogret.websocket.access-token";

    private final AuthCookieService authCookieService;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            String accessToken = authCookieService.readCookie(
                    servletRequest.getServletRequest(), AuthCookieService.ACCESS_COOKIE);
            if (accessToken != null && !accessToken.isBlank()) {
                attributes.put(ACCESS_TOKEN_ATTRIBUTE, accessToken);
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
        // No post-handshake work is required.
    }
}
