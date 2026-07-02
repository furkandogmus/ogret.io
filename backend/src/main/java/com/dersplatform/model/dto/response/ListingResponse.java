package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.TutorListing;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data @AllArgsConstructor @Builder
public class ListingResponse {
    private UUID id;
    private UUID tutorId;
    private String tutorName;
    private String tutorAvatar;
    private UUID subjectId;
    private String subjectName;
    private String title;
    private String lessonDescription;
    private String aboutTutor;
    private BigDecimal hourlyRate;
    private boolean allowsTutorHome;
    private boolean allowsStudentHome;
    private boolean allowsOnline;
    private Integer maxTravelDistanceKm;
    private List<String> languages;
    private String status;
    private String createdAt;

    public static ListingResponse fromEntity(TutorListing listing) {
        return ListingResponse.builder()
                .id(listing.getId())
                .tutorId(listing.getTutor().getId())
                .tutorName(listing.getTutor().getFullName())
                .tutorAvatar(listing.getTutor().getAvatarUrl())
                .subjectId(listing.getSubject().getId())
                .subjectName(listing.getSubject().getName())
                .title(listing.getTitle())
                .lessonDescription(listing.getLessonDescription())
                .aboutTutor(listing.getAboutTutor())
                .hourlyRate(listing.getHourlyRate())
                .allowsTutorHome(listing.isAllowsTutorHome())
                .allowsStudentHome(listing.isAllowsStudentHome())
                .allowsOnline(listing.isAllowsOnline())
                .maxTravelDistanceKm(listing.getMaxTravelDistanceKm())
                .languages(listing.getLanguages())
                .status(listing.getStatus())
                .createdAt(listing.getCreatedAt() != null ? listing.getCreatedAt().toString() : null)
                .build();
    }
}
