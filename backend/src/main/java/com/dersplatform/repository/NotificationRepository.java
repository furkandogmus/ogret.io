package com.dersplatform.repository;

import com.dersplatform.model.entity.AppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<AppNotification, UUID> {
    List<AppNotification> findTop100ByRecipientIdOrderByCreatedAtDesc(UUID recipientId);
    long countByRecipientIdAndIsReadFalse(UUID recipientId);
    Optional<AppNotification> findByIdAndRecipientId(UUID id, UUID recipientId);
    void deleteByRecipientId(UUID recipientId);

    @Modifying
    @Query("UPDATE AppNotification n SET n.isRead = true WHERE n.recipient.id = :recipientId AND n.isRead = false")
    int markAllRead(UUID recipientId);
}
