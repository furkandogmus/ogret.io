package com.dersplatform.config;

import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.UserRepository;
import com.dersplatform.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.TestingAuthenticationToken;

import java.util.HashMap;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WebSocketAuthInterceptorTest {

    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private UserRepository userRepository;
    @Mock private StringRedisTemplate stringRedisTemplate;
    @Mock private WebSocketSessionVersionRegistry sessionVersionRegistry;

    private WebSocketAuthInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new WebSocketAuthInterceptor(
                jwtTokenProvider, userRepository, stringRedisTemplate, sessionVersionRegistry);
    }

    @Test
    void cookieTokenReplacesHandshakePrincipalAndRegistersTokenVersion() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .role(Role.STUDENT)
                .tokenVersion(4)
                .build();
        when(jwtTokenProvider.validateToken("cookie-token")).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken("cookie-token")).thenReturn(userId);
        when(jwtTokenProvider.getTokenVersion("cookie-token")).thenReturn(4);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        StompHeaderAccessor connect = StompHeaderAccessor.create(StompCommand.CONNECT);
        connect.setSessionId("session-1");
        connect.setUser(new TestingAuthenticationToken(userId.toString(), null));
        var sessionAttributes = new HashMap<String, Object>();
        sessionAttributes.put(WebSocketCookieHandshakeInterceptor.ACCESS_TOKEN_ATTRIBUTE, "cookie-token");
        connect.setSessionAttributes(sessionAttributes);
        connect.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], connect.getMessageHeaders());

        Message<?> result = interceptor.preSend(message, null);

        StompHeaderAccessor authenticated = MessageHeaderAccessor.getAccessor(result, StompHeaderAccessor.class);
        assertThat(authenticated).isNotNull();
        assertThat(authenticated.getUser()).isNotNull();
        assertThat(authenticated.getUser().getName()).isEqualTo(userId.toString());
        assertThat(((org.springframework.security.core.Authentication) authenticated.getUser()).getDetails())
                .isEqualTo(4);
        verify(sessionVersionRegistry).register("session-1", userId, 4);
    }

    @Test
    void disconnectAlwaysRemovesRegisteredSession() {
        StompHeaderAccessor disconnect = StompHeaderAccessor.create(StompCommand.DISCONNECT);
        disconnect.setSessionId("session-1");
        disconnect.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], disconnect.getMessageHeaders());

        assertThat(interceptor.preSend(message, null)).isSameAs(message);
        verify(sessionVersionRegistry).remove("session-1");
    }
}
