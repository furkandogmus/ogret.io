package com.dersplatform.service;

import com.dersplatform.model.entity.TutorVerification;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.model.dto.response.ProfileCompletionResponse;
import com.dersplatform.model.dto.request.UpdateProfileRequest;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.MessageRepository;
import com.dersplatform.repository.NotificationRepository;
import com.dersplatform.repository.TutorVerificationRepository;
import com.dersplatform.repository.TutorAvailabilityRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.TutorSubjectRepository;
import com.dersplatform.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
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
    @Mock private ProfileCompletionService profileCompletionService;
    @Mock private TutorSubjectRepository tutorSubjectRepository;
    @Mock private TutorListingRepository tutorListingRepository;
    @Mock private TutorAvailabilityRepository tutorAvailabilityRepository;
    @Mock private EntityManager entityManager;

    private UserService service() {
        org.mockito.Mockito.lenient().when(profileCompletionService.refresh(org.mockito.ArgumentMatchers.any()))
                .thenReturn(ProfileCompletionResponse.builder()
                        .score(50)
                        .complete(false)
                        .completedItems(1)
                        .totalItems(2)
                        .items(List.of())
                        .build());
        return new UserService(userRepository, fileStorageService, passwordEncoder, lessonRepository,
                messageRepository, tutorVerificationRepository, notificationRepository, profileCompletionService);
    }

    private UserService serviceWithRealCompletion() {
        ProfileCompletionService realCompletion = new ProfileCompletionService(
                userRepository, tutorSubjectRepository, tutorListingRepository,
                tutorAvailabilityRepository, entityManager);
        return new UserService(userRepository, fileStorageService, passwordEncoder, lessonRepository,
                messageRepository, tutorVerificationRepository, notificationRepository, realCompletion);
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
    void uploadingAvatarDeletesOldObjectOnlyAfterCommit() {
        UUID userId = UUID.randomUUID();
        User user = user(userId);
        String oldUrl = "/storage/public-files/avatars/11111111-1111-1111-1111-111111111111.png";
        String newUrl = "/storage/public-files/avatars/22222222-2222-2222-2222-222222222222.png";
        user.setAvatarUrl(oldUrl);
        when(fileStorageService.uploadFile(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .thenReturn(newUrl);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        TransactionSynchronizationManager.initSynchronization();
        try {
            var result = service().uploadAvatar(userId,
                    new MockMultipartFile("file", "avatar.png", "image/png", new byte[]{1}));

            assertThat(result.getAvatarUrl()).isEqualTo(newUrl);
            verify(fileStorageService, never()).deleteFile(oldUrl);
            verify(fileStorageService, never()).deleteFile(newUrl);

            TransactionSynchronizationManager.getSynchronizations()
                    .forEach(sync -> sync.afterCompletion(TransactionSynchronization.STATUS_COMMITTED));
            verify(fileStorageService).deleteFile(oldUrl);
            verify(fileStorageService, never()).deleteFile(newUrl);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void uploadingAvatarRemovesNewObjectWhenTransactionRollsBack() {
        UUID userId = UUID.randomUUID();
        User user = user(userId);
        String oldUrl = "/storage/public-files/avatars/11111111-1111-1111-1111-111111111111.png";
        String newUrl = "/storage/public-files/avatars/22222222-2222-2222-2222-222222222222.png";
        user.setAvatarUrl(oldUrl);
        when(fileStorageService.uploadFile(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .thenReturn(newUrl);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        TransactionSynchronizationManager.initSynchronization();
        try {
            service().uploadAvatar(userId,
                    new MockMultipartFile("file", "avatar.png", "image/png", new byte[]{1}));

            TransactionSynchronizationManager.getSynchronizations()
                    .forEach(sync -> sync.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK));
            verify(fileStorageService).deleteFile(newUrl);
            verify(fileStorageService, never()).deleteFile(oldUrl);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void updatingAvatarWithSameUrlDoesNotDeleteTheActiveObject() {
        UUID userId = UUID.randomUUID();
        String avatarUrl = "/storage/public-files/avatars/11111111-1111-1111-1111-111111111111.png";
        User user = user(userId);
        user.setAvatarUrl(avatarUrl);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(fileStorageService.isManagedPublicAvatarUrl(avatarUrl)).thenReturn(true);

        service().updateAvatar(userId, avatarUrl);

        verify(userRepository, never()).save(user);
        verify(fileStorageService, never()).deleteFile(avatarUrl);
    }

    @Test
    void removingAvatarClearsDatabaseValueAndDeletesObject() {
        UUID userId = UUID.randomUUID();
        String avatarUrl = "/storage/public-files/avatars/11111111-1111-1111-1111-111111111111.png";
        User user = user(userId);
        user.setAvatarUrl(avatarUrl);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        var result = service().removeAvatar(userId);

        assertThat(result.getAvatarUrl()).isNull();
        assertThat(user.getAvatarUrl()).isNull();
        verify(fileStorageService, times(1)).deleteFile(avatarUrl);
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

    @Test
    void studentCompletionTracksProfileAndAvatarMutationsFromZeroToHundred() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("student@example.com")
                .passwordHash("hash")
                .fullName("")
                .phone("")
                .role(Role.STUDENT)
                .build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(org.mockito.ArgumentMatchers.any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        UserService realService = serviceWithRealCompletion();

        var empty = realService.getProfile(userId);
        assertThat(empty.getProfileCompletionScore()).isZero();
        assertThat(empty.isProfileComplete()).isFalse();

        UpdateProfileRequest profile = new UpdateProfileRequest();
        profile.setFullName("Ayşe Öğrenci");
        profile.setPhone("05551234567");
        profile.setBio("Matematik desteği arayan lise öğrencisiyim.");
        var withoutAvatar = realService.updateProfile(userId, profile);
        assertThat(withoutAvatar.getProfileCompletionScore()).isEqualTo(67);
        assertThat(withoutAvatar.isProfileComplete()).isFalse();

        String avatarUrl = "https://files.example.com/avatars/student.png";
        when(fileStorageService.isManagedPublicAvatarUrl(avatarUrl)).thenReturn(true);
        var complete = realService.updateAvatar(userId, avatarUrl);
        assertThat(complete.getProfileCompletionScore()).isEqualTo(100);
        assertThat(complete.isProfileComplete()).isTrue();
        assertThat(complete.getProfileCompletion().getItems())
                .allMatch(ProfileCompletionResponse.Item::isCompleted);
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
