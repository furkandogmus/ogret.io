package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.response.AdminDashboardResponse;
import com.dersplatform.model.dto.response.AdminUserResponse;
import com.dersplatform.model.dto.response.LessonResponse;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.model.entity.AuditLog;
import com.dersplatform.model.entity.TutorVerification;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.model.enums.LessonStatus;
import com.dersplatform.model.enums.VerificationStatus;
import com.dersplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final TutorVerificationRepository tutorVerificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final BlogPostRepository blogPostRepository;
    private final DisputeRepository disputeRepository;
    private final TutorReferenceRepository tutorReferenceRepository;
    private final TutorListingRepository tutorListingRepository;
    private final MessageRepository messageRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate stringRedisTemplate;
    private final ScoringService scoringService;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        return AdminDashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalTutors(userRepository.countByRole(Role.TUTOR))
                .totalStudents(userRepository.countByRole(Role.STUDENT))
                .totalAdmins(userRepository.countByRole(Role.ADMIN))
                .verifiedEmails(userRepository.countVerifiedUsers())
                .completedProfiles(userRepository.countCompletedProfiles())
                .identityVerifiedTutors(userRepository.countIdentityVerifiedByRole(Role.TUTOR))
                .totalLessons(lessonRepository.count())
                .pendingLessons(lessonRepository.countByStatus(LessonStatus.PENDING))
                .confirmedLessons(lessonRepository.countByStatus(LessonStatus.CONFIRMED))
                .completedLessons(lessonRepository.countByStatus(LessonStatus.COMPLETED))
                .activeListings(tutorListingRepository.countByStatus("ACTIVE"))
                .totalMessages(messageRepository.count())
                .pendingVerifications(tutorVerificationRepository.countByStatus(VerificationStatus.PENDING))
                .pendingReferences(tutorReferenceRepository.countByStatus(VerificationStatus.PENDING))
                .openDisputes(disputeRepository.countByStatus("OPEN"))
                .totalBlogPosts(blogPostRepository.count())
                .publishedPosts(blogPostRepository.countByStatus("PUBLISHED"))
                .build();
    }

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getUsers(
            String query,
            Role role,
            Boolean verified,
            Boolean profileComplete,
            Pageable pageable) {
        String normalizedQuery = query == null || query.isBlank()
                ? null
                : query.trim().substring(0, Math.min(query.trim().length(), 100));
        Specification<User> filters = (root, criteriaQuery, builder) -> builder.conjunction();

        if (normalizedQuery != null) {
            String pattern = "%" + normalizedQuery.toLowerCase(Locale.ROOT) + "%";
            filters = filters.and((root, criteriaQuery, builder) -> builder.or(
                    builder.like(builder.lower(root.get("fullName")), pattern),
                    builder.like(builder.lower(root.get("email")), pattern),
                    builder.like(root.get("phone"), "%" + normalizedQuery + "%")));
        }
        if (role != null) {
            filters = filters.and((root, criteriaQuery, builder) -> builder.equal(root.get("role"), role));
        }
        if (verified != null) {
            filters = filters.and((root, criteriaQuery, builder) -> builder.equal(root.get("isVerified"), verified));
        }
        if (profileComplete != null) {
            filters = filters.and((root, criteriaQuery, builder) -> builder.equal(root.get("isProfileComplete"), profileComplete));
        }

        return userRepository.findAll(filters, pageable)
                .map(AdminUserResponse::fromEntity);
    }

    @Transactional
    public UserResponse verifyUser(UUID userId) {
        User user = updateEmailVerificationState(userId, true);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public AdminUserResponse updateEmailVerification(UUID userId, boolean verified) {
        return AdminUserResponse.fromEntity(updateEmailVerificationState(userId, verified));
    }

    private User updateEmailVerificationState(UUID userId, boolean verified) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        if (user.isVerified() == verified) {
            return user;
        }
        user.setVerified(verified);
        user = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
                .action(verified ? "USER_EMAIL_VERIFY" : "USER_EMAIL_UNVERIFY")
                .targetId(userId)
                .details("E-posta doğrulama durumu güncellendi: " + verified)
                .build());
        return user;
    }

    @Transactional
    public void setTemporaryPassword(UUID userId, String temporaryPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        if (user.getRole() == Role.ADMIN) {
            throw ApiException.badRequest("Admin hesaplarının şifresi bu ekrandan değiştirilemez");
        }

        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setTokenVersion((user.getTokenVersion() == null ? 0 : user.getTokenVersion()) + 1);
        userRepository.save(user);
        String normalizedEmail = user.getEmail().trim().toLowerCase(Locale.ROOT);
        stringRedisTemplate.delete("auth:login:attempts:" + normalizedEmail);
        stringRedisTemplate.delete("auth:login:lock:" + normalizedEmail);
        auditLogRepository.save(AuditLog.builder()
                .action("USER_TEMPORARY_PASSWORD_SET")
                .targetId(userId)
                .details("Geçici şifre admin tarafından yenilendi; mevcut oturumlar kapatıldı")
                .build());
    }

    public List<Map<String, Object>> getVerifications() {
        return tutorVerificationRepository.findByStatusOrderByCreatedAtDesc(VerificationStatus.PENDING)
                .stream()
                .map(v -> Map.<String, Object>of(
                        "id", v.getId(),
                        "tutorId", v.getTutor().getId(),
                        "tutorName", v.getTutor().getFullName(),
                        "documentType", v.getDocumentType(),
                        "documentUrl", fileStorageService.generatePresignedUrl(v.getDocumentUrl()),
                        "status", v.getStatus(),
                        "createdAt", v.getCreatedAt()))
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
            scoringService.recompute(tutor.getId());
        }

        auditLogRepository.save(AuditLog.builder()
                .action(approved ? "VERIFICATION_APPROVE" : "VERIFICATION_REJECT")
                .targetId(verificationId)
                .details("Doğrulama " + (approved ? "onaylandı" : "reddedildi") + ". Not: " + adminNote)
                .build());
    }

    public Page<LessonResponse> getLessons(Pageable pageable) {
        return lessonRepository.findAll(pageable)
                .map(LessonResponse::fromEntity);
    }

    @Scheduled(cron = "0 0 4 * * ?")
    @Transactional
    public void cleanupAuditLogs() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(90);
        auditLogRepository.deleteByCreatedAtBefore(cutoff);
    }
}
