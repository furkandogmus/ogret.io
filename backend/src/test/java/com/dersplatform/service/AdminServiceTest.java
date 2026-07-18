package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.entity.AuditLog;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.AuditLogRepository;
import com.dersplatform.repository.BlogPostRepository;
import com.dersplatform.repository.DisputeRepository;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.MessageRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.TutorReferenceRepository;
import com.dersplatform.repository.TutorVerificationRepository;
import com.dersplatform.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private LessonRepository lessonRepository;
    @Mock private TutorVerificationRepository tutorVerificationRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private BlogPostRepository blogPostRepository;
    @Mock private DisputeRepository disputeRepository;
    @Mock private TutorReferenceRepository tutorReferenceRepository;
    @Mock private TutorListingRepository tutorListingRepository;
    @Mock private MessageRepository messageRepository;
    @Mock private FileStorageService fileStorageService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private StringRedisTemplate stringRedisTemplate;
    @Mock private ScoringService scoringService;

    @InjectMocks private AdminService adminService;

    @Test
    void setTemporaryPassword_replacesPasswordAndRevokesExistingSessions() {
        User student = User.builder()
                .id(UUID.randomUUID())
                .email("Locked.User@Example.com")
                .role(Role.STUDENT)
                .passwordHash("old-hash")
                .tokenVersion(2)
                .build();
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(passwordEncoder.encode("gecici-123")).thenReturn("new-hash");

        adminService.setTemporaryPassword(student.getId(), "gecici-123");

        assertEquals("new-hash", student.getPasswordHash());
        assertEquals(3, student.getTokenVersion());
        verify(userRepository).save(student);
        verify(stringRedisTemplate).delete("auth:login:attempts:locked.user@example.com");
        verify(stringRedisTemplate).delete("auth:login:lock:locked.user@example.com");

        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(auditCaptor.capture());
        assertEquals("USER_TEMPORARY_PASSWORD_SET", auditCaptor.getValue().getAction());
        assertEquals(student.getId(), auditCaptor.getValue().getTargetId());
    }

    @Test
    void setTemporaryPassword_rejectsAdminAccounts() {
        User admin = User.builder().id(UUID.randomUUID()).role(Role.ADMIN).build();
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));

        assertThrows(ApiException.class,
                () -> adminService.setTemporaryPassword(admin.getId(), "gecici-123"));

        verify(passwordEncoder, never()).encode("gecici-123");
        verify(userRepository, never()).save(admin);
    }
}
