package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.SendMessageRequest;
import com.dersplatform.model.dto.response.MessageResponse;
import com.dersplatform.model.entity.Message;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.MessageType;
import com.dersplatform.repository.MessageRepository;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public MessageResponse sendMessage(UUID senderId, SendMessageRequest request) {
        if (senderId.equals(request.getReceiverId())) {
            throw ApiException.badRequest("Kendinize mesaj gönderemezsiniz");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> ApiException.notFound("Gönderen bulunamadı"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> ApiException.notFound("Alıcı bulunamadı"));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .messageType(request.getMessageType() != null ? request.getMessageType() : MessageType.TEXT)
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        // Push real-time notification to the receiver
        notificationService.notifyNewMessage(sender, receiver, request.getContent());

        return MessageResponse.fromEntity(message);
    }

    public List<MessageResponse> getConversation(UUID userId1, UUID userId2) {
        return messageRepository.findConversation(userId1, userId2)
                .stream()
                .map(MessageResponse::fromEntity)
                .toList();
    }

    @Transactional
    public void markAsRead(UUID messageId, UUID userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> ApiException.notFound("Mesaj bulunamadı"));

        if (message.getReceiver().getId().equals(userId)) {
            message.setRead(true);
            messageRepository.save(message);
        }
    }

    public List<MessageResponse> getUnreadMessages(UUID userId) {
        return messageRepository.findUnreadMessages(userId)
                .stream()
                .map(MessageResponse::fromEntity)
                .toList();
    }
}
