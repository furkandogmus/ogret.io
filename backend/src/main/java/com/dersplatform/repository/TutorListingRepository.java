package com.dersplatform.repository;

import com.dersplatform.model.entity.TutorListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
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

    @Query("SELECT DISTINCT l.tutor.id FROM TutorListing l WHERE l.status = 'ACTIVE'")
    List<UUID> findDistinctTutorIdsWithActiveListings();

    @Query("SELECT l FROM TutorListing l JOIN FETCH l.tutor t JOIN FETCH l.subject s WHERE l.status = 'ACTIVE' " +
           "AND (:subjectId IS NULL OR l.subject.id = :subjectId) " +
           "AND (:minPrice IS NULL OR l.hourlyRate >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.hourlyRate <= :maxPrice) " +
           "AND (:online IS NULL OR :online = FALSE OR l.allowsOnline = TRUE)")
    List<TutorListing> searchActiveListings(UUID subjectId, BigDecimal minPrice, BigDecimal maxPrice, Boolean online);

    @Query("SELECT l FROM TutorListing l JOIN FETCH l.tutor t JOIN FETCH l.subject s WHERE l.status = 'ACTIVE' " +
           "AND (:subjectId IS NULL OR l.subject.id = :subjectId) " +
           "AND (:minPrice IS NULL OR l.hourlyRate >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.hourlyRate <= :maxPrice) " +
           "AND (:online IS NULL OR :online = FALSE OR l.allowsOnline = TRUE)")
    Page<TutorListing> searchActiveListingsPaged(UUID subjectId, BigDecimal minPrice, BigDecimal maxPrice, Boolean online, Pageable pageable);
}
