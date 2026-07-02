package com.dersplatform.repository;

import com.dersplatform.model.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findByTutorIdAndIsActiveTrue(UUID tutorId);
}
