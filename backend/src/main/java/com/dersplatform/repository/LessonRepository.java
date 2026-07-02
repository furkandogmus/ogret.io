package com.dersplatform.repository;

import com.dersplatform.model.entity.Lesson;
import com.dersplatform.model.enums.LessonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {

    @Query("SELECT l FROM Lesson l JOIN FETCH l.student JOIN FETCH l.tutor JOIN FETCH l.subject WHERE l.student.id = :studentId ORDER BY l.createdAt DESC")
    List<Lesson> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    @Query("SELECT l FROM Lesson l JOIN FETCH l.student JOIN FETCH l.tutor JOIN FETCH l.subject WHERE l.tutor.id = :tutorId ORDER BY l.createdAt DESC")
    List<Lesson> findByTutorIdOrderByCreatedAtDesc(UUID tutorId);

    long countByTutorIdAndStatus(UUID tutorId, LessonStatus status);
}
