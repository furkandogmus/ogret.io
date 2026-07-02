package com.dersplatform.repository;

import com.dersplatform.model.entity.UserAgreementAcceptance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserAgreementAcceptanceRepository extends JpaRepository<UserAgreementAcceptance, UUID> {
    boolean existsByUserIdAndAgreementSlug(UUID userId, String slug);
}
