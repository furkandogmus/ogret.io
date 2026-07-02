package com.dersplatform.repository;

import com.dersplatform.model.entity.TutorVerification;
import com.dersplatform.model.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TutorVerificationRepository extends JpaRepository<TutorVerification, UUID> {
    List<TutorVerification> findByStatusOrderByCreatedAtDesc(VerificationStatus status);
    List<TutorVerification> findByTutorId(UUID tutorId);
}
