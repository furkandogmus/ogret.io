package com.dersplatform.config;

import com.dersplatform.security.JwtTokenProvider;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final WebSocketSessionVersionRegistry sessionVersionRegistry;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            String token = authHeader != null && authHeader.startsWith("Bearer ")
                    ? authHeader.substring(7)
                    : cookieToken(accessor);
            if (token != null) {
                if (!jwtTokenProvider.validateToken(token)) {
                    throw new MessageDeliveryException("WebSocket oturumu geçersiz");
                }
                UUID userId = jwtTokenProvider.getUserIdFromToken(token);
                var user = userRepository.findById(userId).orElse(null);
                int currentVersion = user == null || user.getTokenVersion() == null ? 0 : user.getTokenVersion();
                if (user == null || jwtTokenProvider.getTokenVersion(token) != currentVersion) {
                    throw new MessageDeliveryException("WebSocket oturumu geçersiz");
                }
                authenticateSession(accessor, user, currentVersion);
                return message;
            }
            if (accessor.getUser() != null) {
                authenticateExistingPrincipal(accessor);
                return message;
            }
            throw new MessageDeliveryException("Lütfen giriş yapın");
        }

        if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            sessionVersionRegistry.remove(accessor.getSessionId());
            return message;
        }

        if (accessor.getUser() == null) {
            throw new MessageDeliveryException("Lütfen giriş yapın");
        }

        if ((StompCommand.SEND.equals(accessor.getCommand())
                || StompCommand.SUBSCRIBE.equals(accessor.getCommand()))
                && !sessionVersionRegistry.isCurrent(accessor.getSessionId())) {
            throw new MessageDeliveryException("WebSocket oturumu geçersiz");
        }

        String destination = accessor.getDestination();
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand()) && !isAllowedSubscription(destination)) {
            throw new MessageDeliveryException("Bu WebSocket kanalına abone olma yetkiniz yok");
        }
        if (StompCommand.SEND.equals(accessor.getCommand())) {
            if (destination == null || !destination.matches("^/app/chat\\.(send|typing)/[0-9a-fA-F-]{36}$")) {
                throw new MessageDeliveryException("Geçersiz WebSocket hedefi");
            }
            enforceRateLimit(accessor.getUser().getName(), destination.contains("typing") ? "typing" : "message");
        }

        return message;
    }

    private String cookieToken(StompHeaderAccessor accessor) {
        Map<String, Object> attributes = accessor.getSessionAttributes();
        if (attributes == null) return null;
        Object value = attributes.get(WebSocketCookieHandshakeInterceptor.ACCESS_TOKEN_ATTRIBUTE);
        return value instanceof String token && !token.isBlank() ? token : null;
    }

    private void authenticateExistingPrincipal(StompHeaderAccessor accessor) {
        try {
            UUID userId = UUID.fromString(accessor.getUser().getName());
            var user = userRepository.findById(userId)
                    .orElseThrow(() -> new MessageDeliveryException("WebSocket oturumu geçersiz"));
            int currentVersion = user.getTokenVersion() == null ? 0 : user.getTokenVersion();
            authenticateSession(accessor, user, currentVersion);
        } catch (IllegalArgumentException ignored) {
            throw new MessageDeliveryException("WebSocket oturumu geçersiz");
        }
    }

    private void authenticateSession(
            StompHeaderAccessor accessor,
            com.dersplatform.model.entity.User user,
            int tokenVersion) {
        UUID userId = user.getId();
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userId.toString(), null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        authentication.setDetails(tokenVersion);
        accessor.setUser(authentication);
        sessionVersionRegistry.register(accessor.getSessionId(), userId, tokenVersion);
    }

    private boolean isAllowedSubscription(String destination) {
        return destination != null && List.of(
                "/user/queue/messages",
                "/user/queue/notifications",
                "/user/queue/typing").contains(destination);
    }

    private void enforceRateLimit(String userId, String action) {
        int limit = "typing".equals(action) ? 120 : 30;
        String key = "ws:rate:" + action + ":" + userId;
        Long count = stringRedisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            stringRedisTemplate.expire(key, 60, TimeUnit.SECONDS);
        }
        if (count != null && count > limit) {
            throw new MessageDeliveryException("WebSocket hız limiti aşıldı");
        }
    }
}
