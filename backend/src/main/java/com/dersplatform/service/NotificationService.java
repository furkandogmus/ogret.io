package com.dersplatform.service;

import com.dersplatform.model.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Central notification service that pushes real-time notifications
 * to users via WebSocket (STOMP /user/queue/notifications).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send a notification to a specific user.
     *
     * @param recipientId  the user to notify
     * @param type         notification type (message, lesson_request, lesson_confirmed, lesson_cancelled, review, reference_approved)
     * @param title        short title
     * @param body         notification body text
     * @param link         optional deep link
     * @param senderName   optional sender display name
     * @param senderAvatar optional sender avatar URL
     */
    @Async
    public void sendNotification(UUID recipientId, String type, String title, String body,
                                  String link, String senderName, String senderAvatar) {
        Map<String, Object> payload = Map.of(
                "id", "notif-" + UUID.randomUUID(),
                "type", type,
                "title", title,
                "body", body,
                "link", link != null ? link : "",
                "senderName", senderName != null ? senderName : "",
                "senderAvatar", senderAvatar != null ? senderAvatar : "",
                "read", false,
                "createdAt", LocalDateTime.now().toString()
        );

        messagingTemplate.convertAndSendToUser(
                recipientId.toString(), "/queue/notifications", payload);

        log.debug("Notification sent to user {}: [{}] {}", recipientId, type, title);
    }

    // ── Convenience Methods ──

    public void notifyNewMessage(User sender, User receiver, String messageContent) {
        String preview = messageContent.length() > 80
                ? messageContent.substring(0, 80) + "…"
                : messageContent;
        sendNotification(
                receiver.getId(),
                "message",
                "Yeni Mesaj",
                sender.getFullName() + ": " + preview,
                "/mesajlar?userId=" + sender.getId(),
                sender.getFullName(),
                sender.getAvatarUrl()
        );
    }

    public void notifyLessonRequest(User student, User tutor, String subjectName) {
        sendNotification(
                tutor.getId(),
                "lesson_request",
                "Yeni Ders Talebi",
                student.getFullName() + " size " + subjectName + " dersi için ders talebi gönderdi.",
                "/ogretmen-panel",
                student.getFullName(),
                student.getAvatarUrl()
        );
    }

    public void notifyLessonConfirmed(User tutor, User student, String subjectName) {
        sendNotification(
                student.getId(),
                "lesson_confirmed",
                "Ders Onaylandı ✓",
                tutor.getFullName() + " öğretmen " + subjectName + " ders talebinizi onayladı!",
                "/ogrenci-panel?section=lessons",
                tutor.getFullName(),
                tutor.getAvatarUrl()
        );
    }

    public void notifyLessonCancelled(User canceller, User otherParty, String subjectName, boolean cancelledByStudent) {
        String title = cancelledByStudent ? "Ders İptal Edildi" : "Ders İptal Edildi";
        String body = canceller.getFullName() + " tarafından " + subjectName + " dersi iptal edildi.";
        String link = cancelledByStudent ? "/ogretmen-panel" : "/ogrenci-panel?section=lessons";

        sendNotification(
                otherParty.getId(),
                "lesson_cancelled",
                title,
                body,
                link,
                canceller.getFullName(),
                canceller.getAvatarUrl()
        );
    }

    public void notifyLessonCompleted(User tutor, User student, String subjectName) {
        sendNotification(
                student.getId(),
                "lesson_completed",
                "Ders Tamamlandı",
                tutor.getFullName() + " ile " + subjectName + " dersiniz tamamlandı. Değerlendirme yapabilirsiniz!",
                "/ogrenci-panel?section=lessons",
                tutor.getFullName(),
                tutor.getAvatarUrl()
        );
    }

    public void notifyNewReview(User student, User tutor, int rating) {
        String stars = "★".repeat(rating);
        sendNotification(
                tutor.getId(),
                "review",
                "Yeni Değerlendirme " + stars,
                student.getFullName() + " size " + rating + " yıldızlı bir değerlendirme bıraktı.",
                "/ogretmen-panel",
                student.getFullName(),
                student.getAvatarUrl()
        );
    }

    public void notifyReferenceApproved(User tutor, String referrerName) {
        sendNotification(
                tutor.getId(),
                "reference_approved",
                "Referans Onaylandı",
                referrerName + " tarafından verilen referansınız onaylandı.",
                "/ogretmen-panel",
                referrerName,
                null
        );
    }
}
