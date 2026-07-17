package com.dersplatform.service;

import com.dersplatform.model.entity.TutorVerification;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.MessageRepository;
import com.dersplatform.repository.NotificationRepository;
import com.dersplatform.repository.TutorVerificationRepository;
import com.dersplatform.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private FileStorageService fileStorageService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private LessonRepository lessonRepository;
    @Mock private MessageRepository messageRepository;
    @Mock private TutorVerificationRepository tutorVerificationRepository;
    @Mock private NotificationRepository notificationRepository;

    private UserService service() {
        return new UserService(userRepository, fileStorageService, passwordEncoder, lessonRepository,
                messageRepository, tutorVerificationRepository, notificationRepository);
    }

    @Test
    void updatingAvatarDoesNotDeletePrivateUserData() {
        UUID userId = UUID.randomUUID();
        User user = user(userId);
        user.setAvatarUrl("https://files.example.com/avatars/old.png");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(fileStorageService.isManagedPublicAvatarUrl("https://files.example.com/avatars/new.png"))
                .thenReturn(true);
        when(userRepository.save(user)).thenReturn(user);

        service().updateAvatar(userId, "https://files.example.com/avatars/new.png");

        verify(fileStorageService).deleteFile("https://files.example.com/avatars/old.png");
        verify(tutorVerificationRepository, never()).findByTutorId(userId);
        verify(messageRepository, never()).deleteBySenderIdOrReceiverId(userId, userId);
        verify(notificationRepository, never()).deleteByRecipientId(userId);
        assertThat(user.getAvatarUrl()).isEqualTo("https://files.example.com/avatars/new.png");
    }

    @Test
    void deletingAccountRemovesPrivateArtifactsAndAnonymizesUser() {
        UUID userId = UUID.randomUUID();
        User user = user(userId);
        user.setAvatarUrl("https://files.example.com/avatars/avatar.png");
        TutorVerification verification = TutorVerification.builder()
                .documentUrl("identity-document:private.pdf")
                .build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(tutorVerificationRepository.findByTutorId(userId)).thenReturn(List.of(verification));
        when(passwordEncoder.encode(org.mockito.ArgumentMatchers.anyString())).thenReturn("encoded-tombstone");

        service().deleteAccount(userId);

        verify(fileStorageService).deleteFile("https://files.example.com/avatars/avatar.png");
        verify(fileStorageService).deleteFile("identity-document:private.pdf");
        verify(tutorVerificationRepository).deleteAll(List.of(verification));
        verify(messageRepository).deleteBySenderIdOrReceiverId(userId, userId);
        verify(notificationRepository).deleteByRecipientId(userId);
        verify(userRepository).save(user);
        assertThat(user.getDeletedAt()).isNotNull();
        assertThat(user.getFullName()).isEqualTo("Silinmiş Kullanıcı");
        assertThat(user.getEmail()).startsWith("deleted+");
        assertThat(user.isVerified()).isFalse();
    }

    private User user(UUID id) {
        return User.builder()
                .id(id)
                .email("user@example.com")
                .phone("5551234567")
                .passwordHash("hash")
                .fullName("Test User")
                .role(Role.STUDENT)
                .isVerified(true)
                .tokenVersion(0)
                .build();
    }
}
