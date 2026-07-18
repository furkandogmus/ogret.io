package com.dersplatform.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.support.MessageBuilder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WebSocketOutboundAuthInterceptorTest {

    @Mock
    private WebSocketSessionVersionRegistry sessionVersionRegistry;

    private WebSocketOutboundAuthInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new WebSocketOutboundAuthInterceptor(sessionVersionRegistry);
    }

    @Test
    void connectAckIsNeverBlockedByVersionValidation() {
        Message<byte[]> message = message("CONNECT_ACK", "session-1");

        assertThat(interceptor.preSend(message, null)).isSameAs(message);
        verifyNoInteractions(sessionVersionRegistry);
    }

    @Test
    void currentSessionReceivesBrokerMessages() {
        Message<byte[]> message = message("MESSAGE", "session-1");
        when(sessionVersionRegistry.isCurrent("session-1")).thenReturn(true);

        assertThat(interceptor.preSend(message, null)).isSameAs(message);
    }

    @Test
    void revokedSessionDoesNotReceiveBrokerMessages() {
        Message<byte[]> message = message("MESSAGE", "session-1");
        when(sessionVersionRegistry.isCurrent("session-1")).thenReturn(false);

        assertThat(interceptor.preSend(message, null)).isNull();
    }

    private Message<byte[]> message(String messageType, String sessionId) {
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.create(
                SimpMessageType.valueOf(messageType));
        accessor.setSessionId(sessionId);
        accessor.setLeaveMutable(true);
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }
}
