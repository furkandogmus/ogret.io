package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data @AllArgsConstructor @Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String phone;
    private String fullName;
    private String avatarUrl;
    private Role role;
    private boolean isVerified;
    private boolean isProfileComplete;
    private String bio;
    private String education;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private BigDecimal ratingAvg;
    private Integer ratingCount;
    private boolean isOnline;
    private boolean isIdentityVerified;
    private BigDecimal popularityScore;
    private BigDecimal responseTimeHours;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .isVerified(user.isVerified())
                .isProfileComplete(user.isProfileComplete())
                .bio(user.getBio())
                .education(user.getEducation())
                .experienceYears(user.getExperienceYears())
                .hourlyRate(user.getHourlyRate())
                .ratingAvg(user.getRatingAvg())
                .ratingCount(user.getRatingCount())
                .isOnline(user.isOnline())
                .isIdentityVerified(user.isIdentityVerified())
                .popularityScore(user.getPopularityScore())
                .responseTimeHours(user.getResponseTimeHours())
                .build();
    }
}
