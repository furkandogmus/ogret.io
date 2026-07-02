package com.dersplatform.repository;

import com.dersplatform.model.entity.TutorListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TutorListingRepository extends JpaRepository<TutorListing, UUID> {

    @Query("SELECT l FROM TutorListing l JOIN FETCH l.tutor JOIN FETCH l.subject WHERE l.tutor.id = :tutorId")
    List<TutorListing> findByTutorId(UUID tutorId);

    @Query("SELECT l FROM TutorListing l JOIN FETCH l.tutor JOIN FETCH l.subject WHERE l.tutor.id = :tutorId AND l.status = :status ORDER BY l.createdAt DESC")
    List<TutorListing> findByTutorIdAndStatusOrderByCreatedAtDesc(UUID tutorId, String status);

    @Query("SELECT l FROM TutorListing l JOIN FETCH l.tutor JOIN FETCH l.subject WHERE l.tutor.id = :tutorId AND l.subject.id = :subjectId")
    Optional<TutorListing> findByTutorIdAndSubjectId(UUID tutorId, UUID subjectId);

    @Query("SELECT l FROM TutorListing l JOIN FETCH l.tutor JOIN FETCH l.subject WHERE l.status = :status ORDER BY l.createdAt DESC")
    List<TutorListing> findByStatusOrderByCreatedAtDesc(String status);
}
