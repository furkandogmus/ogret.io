package com.dersplatform.repository;

import com.dersplatform.model.entity.TutorListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TutorListingRepository extends JpaRepository<TutorListing, UUID> {
    List<TutorListing> findByTutorId(UUID tutorId);
    List<TutorListing> findByTutorIdAndStatusOrderByCreatedAtDesc(UUID tutorId, String status);
    List<TutorListing> findBySubjectIdAndStatusOrderByCreatedAtDesc(UUID subjectId, String status);
    List<TutorListing> findByStatusOrderByCreatedAtDesc(String status);
    Optional<TutorListing> findByTutorIdAndSubjectId(UUID tutorId, UUID subjectId);

    @Query("SELECT DISTINCT l.tutor.id FROM TutorListing l WHERE l.status = 'ACTIVE'")
    List<UUID> findDistinctTutorIdsWithActiveListings();
}
