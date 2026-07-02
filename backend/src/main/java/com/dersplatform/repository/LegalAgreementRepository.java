package com.dersplatform.repository;

import com.dersplatform.model.entity.LegalAgreement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LegalAgreementRepository extends JpaRepository<LegalAgreement, UUID> {
    Optional<LegalAgreement> findBySlug(String slug);
}
