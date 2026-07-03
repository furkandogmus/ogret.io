package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.SendMessageRequest;
import com.dersplatform.model.dto.response.MessageResponse;
import com.dersplatform.model.entity.Message;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.MessageType;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.MessageRepository;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageResponse sendMessage(UUID senderId, SendMessageRequest request) {
        if (senderId.equals(request.getReceiverId())) {
            throw ApiException.badRequest("Kendinize mesaj gönderemezsiniz");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> ApiException.notFound("Gönderen bulunamadı"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> ApiException.notFound("Alıcı bulunamadı"));

        sender.setLastActiveAt(LocalDateTime.now());
        userRepository.save(sender);

        if (sender.getRole() == Role.TUTOR) {
            computeResponseTime(sender, receiver);
        }

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .messageType(request.getMessageType() != null ? request.getMessageType() : MessageType.TEXT)
                .isRead(false)
                .build();

        message = messageRepository.save(message);
        if (message.getCreatedAt() == null) {
            message.setCreatedAt(LocalDateTime.now());
        }
        MessageResponse response = MessageResponse.fromEntity(message);

        // Push real-time notification to the receiver
        notificationService.notifyNewMessage(sender, receiver, request.getContent());

        // Push real-time message payload to the receiver's chat view
        messagingTemplate.convertAndSendToUser(
                receiver.getId().toString(), "/queue/messages", response);

        return response;
    }

    private void computeResponseTime(User tutor, User student) {
        var conversation = messageRepository.findConversation(tutor.getId(), student.getId());
        if (conversation.size() < 2) return;

        Message lastStudentMsg = null;
        for (int i = conversation.size() - 1; i >= 0; i--) {
            Message msg = conversation.get(i);
            if (msg.getSender().getId().equals(student.getId())) {
                lastStudentMsg = msg;
                break;
            }
        }
        if (lastStudentMsg == null) return;

        long responseMinutes = ChronoUnit.MINUTES.between(lastStudentMsg.getCreatedAt(), LocalDateTime.now());
        if (responseMinutes < 1) responseMinutes = 1;

        BigDecimal current = tutor.getResponseTimeHours();
        if (current == null || current.compareTo(BigDecimal.ZERO) == 0) {
            tutor.setResponseTimeHours(BigDecimal.valueOf(responseMinutes / 60.0).setScale(1, RoundingMode.HALF_UP));
        } else {
            double weighted = (current.doubleValue() * 0.7) + ((responseMinutes / 60.0) * 0.3);
            tutor.setResponseTimeHours(BigDecimal.valueOf(weighted).setScale(1, RoundingMode.HALF_UP));
        }
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

    public List<MessageResponse> getAllMessages(UUID userId) {
        return messageRepository.findAllByUserId(userId)
                .stream()
                .map(MessageResponse::fromEntity)
                .toList();
    }
}
