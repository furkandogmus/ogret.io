package com.dersplatform.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class CreateLessonRequest {
    @NotNull
    private UUID tutorId;

    @NotNull
    private UUID subjectId;

    @NotNull
    private LocalDate lessonDate;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @NotBlank(message = "Ders açıklaması zorunludur")
    private String notes;
}
