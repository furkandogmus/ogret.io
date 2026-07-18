package com.dersplatform.repository;

import com.dersplatform.model.entity.TutorVerification;
import com.dersplatform.model.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TutorVerificationRepository extends JpaRepository<TutorVerification, UUID> {
    long countByStatus(VerificationStatus status);

    @Query("SELECT v FROM TutorVerification v JOIN FETCH v.tutor WHERE v.status = :status ORDER BY v.createdAt DESC")
    List<TutorVerification> findByStatusOrderByCreatedAtDesc(VerificationStatus status);

    @Query("SELECT v FROM TutorVerification v JOIN FETCH v.tutor WHERE v.tutor.id = :tutorId")
    List<TutorVerification> findByTutorId(UUID tutorId);
}
