package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
public class PublicUserResponse {
    private UUID id;
    private String fullName;
    private String avatarUrl;
    private Role role;
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
    private BigDecimal lessonCompletionRate;
    private Integer profileCompletionScore;

    public static PublicUserResponse fromEntity(User user) {
        return PublicUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
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
                .lessonCompletionRate(user.getLessonCompletionRate())
                .profileCompletionScore(user.getProfileCompletionScore())
                .build();
    }
}
