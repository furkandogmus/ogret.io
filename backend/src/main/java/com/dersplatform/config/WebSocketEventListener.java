package com.dersplatform.config;

import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final UserRepository userRepository;

    @EventListener
    public void onConnect(SessionConnectedEvent event) {
        var user = event.getUser();
        if (user != null) {
            setOnline(UUID.fromString(user.getName()), true);
        }
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        var user = event.getUser();
        if (user != null) {
            setOnline(UUID.fromString(user.getName()), false);
        }
    }

    private void setOnline(UUID userId, boolean online) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setOnline(online);
            userRepository.save(u);
        });
    }
}
