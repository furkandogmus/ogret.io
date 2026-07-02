package com.dersplatform.repository;

import com.dersplatform.model.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findByTutorIdAndIsActiveTrue(UUID tutorId);

    @Query("SELECT s FROM Subscription s JOIN FETCH s.tutor WHERE s.isActive = true")
    List<Subscription> findAllActiveWithTutor();
}
