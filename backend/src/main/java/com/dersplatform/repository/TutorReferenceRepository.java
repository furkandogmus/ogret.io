package com.dersplatform.repository;

import com.dersplatform.model.entity.TutorReference;
import com.dersplatform.model.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TutorReferenceRepository extends JpaRepository<TutorReference, UUID> {
    @Query("SELECT r FROM TutorReference r JOIN FETCH r.tutor WHERE r.tutor.id = :tutorId AND r.status = :status ORDER BY r.createdAt DESC")
    List<TutorReference> findByTutorIdAndStatusOrderByCreatedAtDesc(UUID tutorId, VerificationStatus status);

    @Query("SELECT r FROM TutorReference r JOIN FETCH r.tutor WHERE r.tutor.id = :tutorId ORDER BY r.createdAt DESC")
    List<TutorReference> findByTutorIdOrderByCreatedAtDesc(UUID tutorId);

    @Query("SELECT r FROM TutorReference r JOIN FETCH r.tutor WHERE r.status = :status ORDER BY r.createdAt DESC")
    List<TutorReference> findByStatusOrderByCreatedAtDesc(VerificationStatus status);
}
