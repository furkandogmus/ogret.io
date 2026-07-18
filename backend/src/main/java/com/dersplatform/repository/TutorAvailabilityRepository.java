package com.dersplatform.repository;

import com.dersplatform.model.entity.TutorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TutorAvailabilityRepository extends JpaRepository<TutorAvailability, UUID> {
    boolean existsByTutorIdAndIsActiveTrue(UUID tutorId);

    List<TutorAvailability> findByTutorId(UUID tutorId);
    List<TutorAvailability> findByTutorIdAndIsActiveTrue(UUID tutorId);
}
