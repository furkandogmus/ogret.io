package com.dersplatform.repository;

import com.dersplatform.model.entity.TutorReference;
import com.dersplatform.model.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TutorReferenceRepository extends JpaRepository<TutorReference, UUID> {
    List<TutorReference> findByTutorIdAndStatusOrderByCreatedAtDesc(UUID tutorId, VerificationStatus status);
    List<TutorReference> findByTutorIdOrderByCreatedAtDesc(UUID tutorId);
    List<TutorReference> findByStatusOrderByCreatedAtDesc(VerificationStatus status);
}
