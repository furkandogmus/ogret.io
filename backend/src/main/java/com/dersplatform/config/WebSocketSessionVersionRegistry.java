package com.dersplatform.config;

import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Tracks the token version that authenticated each live STOMP session.
 * A password reset or administrative credential rotation increments the user's
 * token version, which immediately makes the registered session stale.
 */
@Component
@RequiredArgsConstructor
public class WebSocketSessionVersionRegistry {

    private final UserRepository userRepository;
    private final ConcurrentMap<String, SessionAuthentication> sessions = new ConcurrentHashMap<>();

    public void register(String sessionId, UUID userId, int tokenVersion) {
        if (sessionId != null && !sessionId.isBlank()) {
            sessions.put(sessionId, new SessionAuthentication(userId, tokenVersion));
        }
    }

    public void remove(String sessionId) {
        if (sessionId != null) {
            sessions.remove(sessionId);
        }
    }

    public boolean isCurrent(String sessionId) {
        if (sessionId == null) {
            return false;
        }
        SessionAuthentication authentication = sessions.get(sessionId);
        if (authentication == null) {
            return false;
        }
        return userRepository.findById(authentication.userId())
                .map(user -> {
                    int currentVersion = user.getTokenVersion() == null ? 0 : user.getTokenVersion();
                    return currentVersion == authentication.tokenVersion();
                })
                .orElse(false);
    }

    record SessionAuthentication(UUID userId, int tokenVersion) {
    }
}
