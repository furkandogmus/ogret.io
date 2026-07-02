package com.dersplatform.repository;

import com.dersplatform.model.entity.FavoriteTutor;
import com.dersplatform.model.entity.FavoriteTutor.FavoriteTutorId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FavoriteTutorRepository extends JpaRepository<FavoriteTutor, FavoriteTutorId> {
    List<FavoriteTutor> findByStudentId(UUID studentId);
    boolean existsByStudentIdAndTutorId(UUID studentId, UUID tutorId);
}
