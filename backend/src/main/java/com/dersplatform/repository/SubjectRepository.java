package com.dersplatform.repository;

import com.dersplatform.model.entity.Subject;
import com.dersplatform.model.enums.SubjectCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    Optional<Subject> findBySlug(String slug);
    List<Subject> findByCategory(SubjectCategory category);
    List<Subject> findByIsActiveTrue();
    List<Subject> findByIsActiveTrueOrderByName();
}
