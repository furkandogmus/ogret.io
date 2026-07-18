package com.dersplatform.model.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalTutors;
    private long totalStudents;
    private long totalAdmins;
    private long verifiedEmails;
    private long completedProfiles;
    private long identityVerifiedTutors;

    private long totalLessons;
    private long pendingLessons;
    private long confirmedLessons;
    private long completedLessons;

    private long activeListings;
    private long totalMessages;
    private long pendingVerifications;
    private long pendingReferences;
    private long openDisputes;

    private long totalBlogPosts;
    private long publishedPosts;
}
