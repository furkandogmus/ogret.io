package com.dersplatform.repository;

import com.dersplatform.model.entity.FavoriteTutor;
import com.dersplatform.model.entity.FavoriteTutor.FavoriteTutorId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface FavoriteTutorRepository extends JpaRepository<FavoriteTutor, FavoriteTutorId> {
    @Query("SELECT f FROM FavoriteTutor f JOIN FETCH f.tutor WHERE f.student.id = :studentId")
    List<FavoriteTutor> findByStudentId(UUID studentId);

    long countByTutorId(UUID tutorId);

    boolean existsByStudentIdAndTutorId(UUID studentId, UUID tutorId);
}
