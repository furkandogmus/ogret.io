package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.Lesson;
import com.dersplatform.model.enums.LessonStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data @AllArgsConstructor @Builder
public class LessonResponse {
    private UUID id;
    private PublicUserResponse student;
    private PublicUserResponse tutor;
    private SubjectResponse subject;
    private LessonStatus status;
    private LocalDate lessonDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private BigDecimal price;
    private String meetingLink;
    private String notes;
    private boolean studentCancelled;
    private String cancellationReason;
    private String createdAt;

    public static LessonResponse fromEntity(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .student(PublicUserResponse.fromEntity(lesson.getStudent()))
                .tutor(PublicUserResponse.fromEntity(lesson.getTutor()))
                .subject(SubjectResponse.fromEntity(lesson.getSubject()))
                .status(lesson.getStatus())
                .lessonDate(lesson.getLessonDate())
                .startTime(lesson.getStartTime())
                .endTime(lesson.getEndTime())
                .durationMinutes(lesson.getDurationMinutes())
                .price(lesson.getPrice())
                .meetingLink(lesson.getMeetingLink())
                .notes(lesson.getNotes())
                .studentCancelled(lesson.isStudentCancelled())
                .cancellationReason(lesson.getCancellationReason())
                .createdAt(lesson.getCreatedAt() != null ? lesson.getCreatedAt().toString() : null)
                .build();
    }
}
