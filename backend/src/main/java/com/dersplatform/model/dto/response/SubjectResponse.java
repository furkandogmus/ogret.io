package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.Subject;
import com.dersplatform.model.enums.SubjectCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data @AllArgsConstructor @Builder
public class SubjectResponse {
    private UUID id;
    private String name;
    private String slug;
    private SubjectCategory category;
    private String icon;

    public static SubjectResponse fromEntity(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .name(subject.getName())
                .slug(subject.getSlug())
                .category(subject.getCategory())
                .icon(subject.getIcon())
                .build();
    }
}
