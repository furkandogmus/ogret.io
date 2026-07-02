package com.dersplatform.repository;

import com.dersplatform.model.entity.Dispute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    Page<Dispute> findByComplainantIdOrderByCreatedAtDesc(UUID complainantId, Pageable pageable);
    Page<Dispute> findByRespondentIdOrderByCreatedAtDesc(UUID respondentId, Pageable pageable);
    Page<Dispute> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    long countByStatus(String status);
}
