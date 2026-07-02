package com.dersplatform.repository;

import com.dersplatform.model.entity.Lesson;
import com.dersplatform.model.enums.LessonStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    List<Lesson> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<Lesson> findByTutorIdOrderByCreatedAtDesc(UUID tutorId);
    long countByTutorIdAndStatus(UUID tutorId, LessonStatus status);
}
