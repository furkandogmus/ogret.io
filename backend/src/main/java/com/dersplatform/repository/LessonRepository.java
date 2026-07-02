package com.dersplatform.repository;

import com.dersplatform.model.entity.Lesson;
import com.dersplatform.model.enums.LessonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {

    @Query("SELECT l FROM Lesson l JOIN FETCH l.student JOIN FETCH l.tutor JOIN FETCH l.subject WHERE l.student.id = :studentId ORDER BY l.createdAt DESC")
    List<Lesson> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    @Query("SELECT l FROM Lesson l JOIN FETCH l.student JOIN FETCH l.tutor JOIN FETCH l.subject WHERE l.tutor.id = :tutorId ORDER BY l.createdAt DESC")
    List<Lesson> findByTutorIdOrderByCreatedAtDesc(UUID tutorId);

    long countByTutorIdAndStatus(UUID tutorId, LessonStatus status);

    @Query("SELECT COUNT(l) > 0 FROM Lesson l WHERE l.tutor.id = :tutorId AND l.lessonDate = :date AND l.status <> 'CANCELLED' AND l.startTime < :endTime AND l.endTime > :startTime")
    boolean existsOverlappingLesson(UUID tutorId, LocalDate date, LocalTime startTime, LocalTime endTime);

    @Query("SELECT l FROM Lesson l JOIN FETCH l.student JOIN FETCH l.tutor JOIN FETCH l.subject WHERE l.id = :id")
    java.util.Optional<Lesson> findByIdWithJoins(UUID id);
}
