package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.AppNotification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private UUID id;
    private String type;
    private String title;
    private String body;
    private String link;
    private String senderName;
    private String senderAvatar;
    private boolean read;
    private LocalDateTime createdAt;

    public static NotificationResponse fromEntity(AppNotification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .body(notification.getBody())
                .link(notification.getLink())
                .senderName(notification.getSenderName())
                .senderAvatar(notification.getSenderAvatar())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
