package com.dersplatform.config;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

/**
 * Drops messages for sockets whose token version was revoked after CONNECT,
 * for example when an admin issues a temporary password.
 */
@Component
@RequiredArgsConstructor
public class WebSocketOutboundAuthInterceptor implements ChannelInterceptor {

    private final WebSocketSessionVersionRegistry sessionVersionRegistry;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        SimpMessageHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                message, SimpMessageHeaderAccessor.class);
        if (accessor == null || accessor.getMessageType() != SimpMessageType.MESSAGE) {
            return message;
        }
        String sessionId = accessor.getSessionId();
        if (sessionId == null) {
            return message;
        }
        return sessionVersionRegistry.isCurrent(sessionId) ? message : null;
    }
}
