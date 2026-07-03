package com.dersplatform.websocket;

import com.dersplatform.model.dto.response.MessageResponse;
import com.dersplatform.model.entity.Message;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.MessageType;
import com.dersplatform.repository.MessageRepository;
import com.dersplatform.repository.UserRepository;
import com.dersplatform.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @MessageMapping("/chat.send/{receiverId}")
    public void sendMessage(
            @DestinationVariable UUID receiverId,
            @Payload Map<String, String> payload,
            Principal principal) {

        if (principal == null) {
            log.warn("Unauthenticated WebSocket message attempt");
            return;
        }

        UUID senderId = UUID.fromString(principal.getName());
        String content = payload.get("content");

        if (content == null || content.isBlank()) return;

        User sender = userRepository.findById(senderId).orElse(null);
        User receiver = userRepository.findById(receiverId).orElse(null);
        if (sender == null || receiver == null) return;

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(content)
                .messageType(MessageType.TEXT)
                .isRead(false)
                .build();

        message = messageRepository.save(message);
        if (message.getCreatedAt() == null) {
            message.setCreatedAt(LocalDateTime.now());
        }
        MessageResponse response = MessageResponse.fromEntity(message);

        // Send the real-time message to the receiver's chat queue
        messagingTemplate.convertAndSendToUser(
                receiverId.toString(), "/queue/messages", response);

        // Also push a notification to the receiver's notification queue
        notificationService.notifyNewMessage(sender, receiver, content);
    }

    @MessageMapping("/chat.typing/{receiverId}")
    public void typing(
            @DestinationVariable UUID receiverId,
            Principal principal) {
        if (principal == null) return;
        UUID senderId = UUID.fromString(principal.getName());
        messagingTemplate.convertAndSendToUser(
                receiverId.toString(), "/queue/typing",
                Map.of("userId", senderId.toString()));
    }
}
