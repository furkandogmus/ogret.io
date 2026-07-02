package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data @AllArgsConstructor @Builder
public class TutorSummaryResponse {
    private UUID id;
    private String fullName;
    private String avatarUrl;
    private String title;
    private String bio;
    private BigDecimal hourlyRate;
    private BigDecimal ratingAvg;
    private Integer ratingCount;
    private Integer experienceYears;
    private boolean isOnline;
    private boolean isIdentityVerified;
    private BigDecimal popularityScore;
    private BigDecimal responseTimeHours;
    private BigDecimal lessonCompletionRate;
    private Integer profileCompletionScore;
    private String premiumPlan;
    private List<String> subjects;
    private List<String> tags;

    public static TutorSummaryResponse fromEntity(User tutor, List<String> subjects, String premiumPlan) {
        return TutorSummaryResponse.builder()
                .id(tutor.getId())
                .fullName(tutor.getFullName())
                .avatarUrl(tutor.getAvatarUrl())
                .title(tutor.getEducation())
                .bio(tutor.getBio())
                .hourlyRate(tutor.getHourlyRate())
                .ratingAvg(tutor.getRatingAvg())
                .ratingCount(tutor.getRatingCount())
                .experienceYears(tutor.getExperienceYears())
                .isOnline(tutor.isOnline())
                .isIdentityVerified(tutor.isIdentityVerified())
                .popularityScore(tutor.getPopularityScore())
                .responseTimeHours(tutor.getResponseTimeHours())
                .lessonCompletionRate(tutor.getLessonCompletionRate())
                .profileCompletionScore(tutor.getProfileCompletionScore())
                .premiumPlan(premiumPlan)
                .subjects(subjects)
                .tags(List.of())
                .build();
    }
}
