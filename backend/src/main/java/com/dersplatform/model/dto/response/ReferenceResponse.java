package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.TutorReference;
import com.dersplatform.model.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data @AllArgsConstructor @Builder
public class ReferenceResponse {
    private UUID id;
    private UUID tutorId;
    private String tutorName;
    private String recommenderName;
    private String recommenderEmail;
    private String recommenderTitle;
    private String comment;
    private VerificationStatus status;
    private String createdAt;

    public static ReferenceResponse fromEntity(TutorReference ref) {
        return ReferenceResponse.builder()
                .id(ref.getId())
                .tutorId(ref.getTutor().getId())
                .tutorName(ref.getTutor().getFullName())
                .recommenderName(ref.getRecommenderName())
                .recommenderEmail(ref.getRecommenderEmail())
                .recommenderTitle(ref.getRecommenderTitle())
                .comment(ref.getComment())
                .status(ref.getStatus())
                .createdAt(ref.getCreatedAt() != null ? ref.getCreatedAt().toString() : null)
                .build();
    }
}
