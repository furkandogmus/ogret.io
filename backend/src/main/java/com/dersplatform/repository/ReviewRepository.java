package com.dersplatform.repository;

import com.dersplatform.model.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByTutorIdOrderByCreatedAtDesc(UUID tutorId);
    List<Review> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    boolean existsByLessonId(UUID lessonId);
}
