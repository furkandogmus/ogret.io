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
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            if (accessor.getUser() != null) {
                return message;
            }
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtTokenProvider.validateToken(token)) {
                    UUID userId = jwtTokenProvider.getUserIdFromToken(token);
                    var user = userRepository.findById(userId).orElse(null);
                    int currentVersion = user == null || user.getTokenVersion() == null ? 0 : user.getTokenVersion();
                    if (user == null || jwtTokenProvider.getTokenVersion(token) != currentVersion) {
                        throw new MessageDeliveryException("WebSocket oturumu geçersiz");
                    }
                    accessor.setUser(new UsernamePasswordAuthenticationToken(
                            userId.toString(), null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))));
                    return message;
                }
            }
            throw new MessageDeliveryException("WebSocket kimlik doğrulaması gerekli");
        }

        if (accessor.getUser() == null) {
            throw new MessageDeliveryException("WebSocket kimlik doğrulaması gerekli");
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
