package com.dersplatform.repository;

import com.dersplatform.model.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    @Query("SELECT r FROM Review r JOIN FETCH r.student JOIN FETCH r.tutor WHERE r.tutor.id = :tutorId ORDER BY r.createdAt DESC")
    List<Review> findByTutorIdOrderByCreatedAtDesc(UUID tutorId);

    @Query("SELECT r FROM Review r JOIN FETCH r.student JOIN FETCH r.tutor WHERE r.student.id = :studentId ORDER BY r.createdAt DESC")
    List<Review> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    boolean existsByLessonId(UUID lessonId);
}
