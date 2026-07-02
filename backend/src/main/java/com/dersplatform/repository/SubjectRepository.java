package com.dersplatform.repository;

import com.dersplatform.model.entity.Subject;
import com.dersplatform.model.enums.SubjectCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    Optional<Subject> findBySlug(String slug);
    List<Subject> findByCategory(SubjectCategory category);
    List<Subject> findByIsActiveTrue();
    List<Subject> findByIsActiveTrueOrderByName();

    @Query("SELECT s FROM Subject s WHERE s.isActive = true AND (:query IS NULL OR :query = '' OR function('similarity', s.name, :query) > 0.2) ORDER BY function('similarity', s.name, :query) DESC")
    List<Subject> searchByName(@Param("query") String query);
}
