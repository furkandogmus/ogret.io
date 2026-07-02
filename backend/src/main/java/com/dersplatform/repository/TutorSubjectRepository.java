package com.dersplatform.repository;

import com.dersplatform.model.entity.TutorSubject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TutorSubjectRepository extends JpaRepository<TutorSubject, UUID> {
    List<TutorSubject> findByTutorId(UUID tutorId);
    List<TutorSubject> findBySubjectId(UUID subjectId);
}
