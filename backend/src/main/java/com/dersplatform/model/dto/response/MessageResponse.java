package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.Message;
import com.dersplatform.model.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data @AllArgsConstructor @Builder
public class MessageResponse {
    private UUID id;
    private UUID senderId;
    private String senderName;
    private String senderAvatar;
    private UUID receiverId;
    private String receiverName;
    private String receiverAvatar;
    private String content;
    private MessageType messageType;
    private String fileUrl;
    private boolean isRead;
    private String createdAt;

    public static MessageResponse fromEntity(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .senderAvatar(message.getSender().getAvatarUrl())
                .receiverId(message.getReceiver().getId())
                .receiverName(message.getReceiver().getFullName())
                .receiverAvatar(message.getReceiver().getAvatarUrl())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .fileUrl(message.getFileUrl())
                .isRead(message.isRead())
                .createdAt(message.getCreatedAt() != null ? message.getCreatedAt().toString() : null)
                .build();
    }
}
