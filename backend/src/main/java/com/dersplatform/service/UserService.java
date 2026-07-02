package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.UpdateProfileRequest;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.model.entity.User;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        return UserResponse.fromEntity(user);
    }

    @Transactional
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
    public UserResponse updateAvatar(UUID userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        
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
        userRepository.save(user);
    }

    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));
        return UserResponse.fromEntity(user);
    }

    public List<UserResponse> searchUsers(String query, UUID excludeUserId) {
        if (query == null || query.isBlank()) return List.of();
        return userRepository.findByFullNameContainingIgnoreCase(query)
                .stream()
                .filter(u -> !u.getId().equals(excludeUserId))
                .map(UserResponse::fromEntity)
                .toList();
    }
}
