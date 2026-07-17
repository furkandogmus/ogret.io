package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.UpdateProfileRequest;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.model.dto.response.PublicUserResponse;
import com.dersplatform.model.dto.response.UserDataExportResponse;
import com.dersplatform.model.dto.response.LessonResponse;
import com.dersplatform.model.dto.response.MessageResponse;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.UserRepository;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.MessageRepository;
import com.dersplatform.repository.TutorVerificationRepository;
import com.dersplatform.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final LessonRepository lessonRepository;
    private final MessageRepository messageRepository;
    private final TutorVerificationRepository tutorVerificationRepository;
    private final NotificationRepository notificationRepository;

    public UserResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"tutorDetail", "userById"}, allEntries = true)
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getEducation() != null) user.setEducation(request.getEducation());
        if (request.getExperienceYears() != null) user.setExperienceYears(request.getExperienceYears());
        if (request.getHourlyRate() != null) user.setHourlyRate(request.getHourlyRate());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        user.setProfileComplete(true);
        user = userRepository.save(user);

        return UserResponse.fromEntity(user);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"tutorDetail", "userById"}, allEntries = true)
    public UserResponse updateAvatar(UUID userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        
        if (!fileStorageService.isManagedPublicAvatarUrl(avatarUrl)) {
            throw ApiException.badRequest("Geçersiz profil fotoğrafı adresi");
        }

        // Delete old avatar if it exists
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
            fileStorageService.deleteFile(user.getAvatarUrl());
        }
        user.setAvatarUrl(avatarUrl);
        user = userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw ApiException.badRequest("Mevcut şifre yanlış");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setTokenVersion((user.getTokenVersion() == null ? 0 : user.getTokenVersion()) + 1);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public UserDataExportResponse exportUserData(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        var lessons = (user.getRole() == Role.TUTOR
                ? lessonRepository.findByTutorIdOrderByCreatedAtDesc(userId)
                : lessonRepository.findByStudentIdOrderByCreatedAtDesc(userId))
                .stream()
                .map(LessonResponse::fromEntity)
                .toList();
        var messages = messageRepository.findAllByUserId(userId)
                .stream()
                .map(MessageResponse::fromEntity)
                .toList();

        return UserDataExportResponse.builder()
                .generatedAt(LocalDateTime.now())
                .formatVersion("1.0")
                .profile(UserResponse.fromEntity(user))
                .lessons(lessons)
                .messages(messages)
                .build();
    }

    @Transactional
    public void deleteAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
            fileStorageService.deleteFile(user.getAvatarUrl());
        }

        var verifications = tutorVerificationRepository.findByTutorId(userId);
        verifications.forEach(verification ->
                fileStorageService.deleteFile(verification.getDocumentUrl()));
        tutorVerificationRepository.deleteAll(verifications);
        messageRepository.deleteBySenderIdOrReceiverId(userId, userId);
        notificationRepository.deleteByRecipientId(userId);

        String tombstone = user.getId().toString().replace("-", "");
        user.setEmail("deleted+" + tombstone + "@invalid.ogret.io");
        user.setPhone("del" + tombstone.substring(0, 16));
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setFullName("Silinmiş Kullanıcı");
        user.setAvatarUrl(null);
        user.setBio(null);
        user.setEducation(null);
        user.setHourlyRate(null);
        user.setOnline(false);
        user.setVerified(false);
        user.setIdentityVerified(false);
        user.setTokenVersion((user.getTokenVersion() == null ? 0 : user.getTokenVersion()) + 1);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public PublicUserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        return PublicUserResponse.fromEntity(user);
    }

    public List<Map<String, Object>> searchUsersSimple(String query) {
        if (query == null || query.isBlank()) return List.of();
        return userRepository.searchByFullText(query).stream()
                .limit(5)
                .map(u -> Map.<String, Object>of(
                    "id", u.getId().toString(),
                    "fullName", u.getFullName(),
                    "avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "",
                    "role", u.getRole().name()
                ))
                .toList();
    }

    public List<PublicUserResponse> searchUsers(String query, UUID excludeUserId) {
        if (query == null || query.isBlank()) return List.of();
        List<User> ftsResults = userRepository.searchByFullText(query)
                .stream()
                .filter(u -> !u.getId().equals(excludeUserId))
                .toList();
        if (!ftsResults.isEmpty()) {
            return ftsResults.stream().map(PublicUserResponse::fromEntity).toList();
        }
        return userRepository.searchByTrigramSimilarity(query)
                .stream()
                .filter(u -> !u.getId().equals(excludeUserId))
                .map(PublicUserResponse::fromEntity)
                .toList();
    }
}
