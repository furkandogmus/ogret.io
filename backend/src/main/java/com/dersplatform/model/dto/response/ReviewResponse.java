package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data @AllArgsConstructor @Builder
public class ReviewResponse {
    private UUID id;
    private String studentName;
    private String studentAvatar;
    private Integer rating;
    private String comment;
    private boolean anonymous;
    private String createdAt;

    public static ReviewResponse fromEntity(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .studentName(review.getStudent().getFullName())
                .studentAvatar(review.getStudent().getAvatarUrl())
                .rating(review.getRating())
                .comment(review.getComment())
                .anonymous(review.isAnonymous())
                .createdAt(review.getCreatedAt() != null ? review.getCreatedAt().toString() : null)
                .build();
    }
}
