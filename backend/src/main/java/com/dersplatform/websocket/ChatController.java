package com.dersplatform.websocket;

import com.dersplatform.model.dto.request.SendMessageRequest;
import com.dersplatform.model.enums.MessageType;
import com.dersplatform.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

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

        if (content == null || content.isBlank() || content.length() > 2000) return;

        SendMessageRequest request = new SendMessageRequest();
        request.setReceiverId(receiverId);
        request.setContent(content);
        request.setMessageType(MessageType.TEXT);
        messageService.sendMessage(senderId, request);
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
