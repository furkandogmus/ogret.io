package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.response.LessonResponse;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.model.entity.AuditLog;
import com.dersplatform.model.entity.TutorVerification;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.model.enums.VerificationStatus;
import com.dersplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final TutorVerificationRepository tutorVerificationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AuditLogRepository auditLogRepository;

    public Map<String, Object> getDashboard() {
        long totalUsers = userRepository.count();
        long totalTutors = userRepository.countByRole(Role.TUTOR);
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalLessons = lessonRepository.count();
        long pendingVerifications = tutorVerificationRepository.findByStatusOrderByCreatedAtDesc(VerificationStatus.PENDING).size();

        return Map.of(
                "totalUsers", totalUsers,
                "totalTutors", totalTutors,
                "totalStudents", totalStudents,
                "totalLessons", totalLessons,
                "pendingVerifications", pendingVerifications
        );
    }

    public List<UserResponse> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    @Transactional
    public UserResponse verifyUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        user.setVerified(true);
        user = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
                .action("USER_VERIFY")
                .targetId(userId)
                .details("Kullanıcı doğrulandı: " + user.getEmail())
                .build());
        return UserResponse.fromEntity(user);
    }

    public List<Map<String, Object>> getVerifications() {
        return tutorVerificationRepository.findByStatusOrderByCreatedAtDesc(VerificationStatus.PENDING)
                .stream()
                .map(v -> Map.<String, Object>of(
                        "id", v.getId(),
                        "tutorId", v.getTutor().getId(),
                        "tutorName", v.getTutor().getFullName(),
                        "documentType", v.getDocumentType(),
                        "documentUrl", v.getDocumentUrl(),
                        "status", v.getStatus(),
                        "createdAt", v.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public void reviewVerification(UUID verificationId, boolean approved, String adminNote) {
        TutorVerification verification = tutorVerificationRepository.findById(verificationId)
                .orElseThrow(() -> ApiException.notFound("Doğrulama bulunamadı"));

        verification.setStatus(approved ? VerificationStatus.APPROVED : VerificationStatus.REJECTED);
        verification.setAdminNote(adminNote);
        verification.setReviewedAt(LocalDateTime.now());
        tutorVerificationRepository.save(verification);

        if (approved) {
            User tutor = verification.getTutor();
            tutor.setIdentityVerified(true);
            userRepository.save(tutor);
        }

        auditLogRepository.save(AuditLog.builder()
                .action(approved ? "VERIFICATION_APPROVE" : "VERIFICATION_REJECT")
                .targetId(verificationId)
                .details("Doğrulama " + (approved ? "onaylandı" : "reddedildi") + ". Not: " + adminNote)
                .build());
    }

    public List<LessonResponse> getLessons() {
        return lessonRepository.findAll()
                .stream()
                .map(LessonResponse::fromEntity)
                .toList();
    }
}
