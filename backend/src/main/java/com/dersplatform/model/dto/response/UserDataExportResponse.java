package com.dersplatform.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class UserDataExportResponse {
    private LocalDateTime generatedAt;
    private String formatVersion;
    private UserResponse profile;
    private List<LessonResponse> lessons;
    private List<MessageResponse> messages;
}
