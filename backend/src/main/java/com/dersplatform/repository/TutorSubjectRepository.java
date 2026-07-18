package com.dersplatform.repository;

import com.dersplatform.model.entity.TutorSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TutorSubjectRepository extends JpaRepository<TutorSubject, UUID> {
    boolean existsByTutorId(UUID tutorId);

    @Query("SELECT ts FROM TutorSubject ts JOIN FETCH ts.tutor JOIN FETCH ts.subject WHERE ts.tutor.id = :tutorId")
    List<TutorSubject> findByTutorId(UUID tutorId);

    @Query("SELECT ts FROM TutorSubject ts JOIN FETCH ts.tutor JOIN FETCH ts.subject WHERE ts.subject.id = :subjectId")
    List<TutorSubject> findBySubjectId(UUID subjectId);

    @Query("SELECT ts FROM TutorSubject ts JOIN FETCH ts.tutor JOIN FETCH ts.subject WHERE ts.tutor.id IN :tutorIds")
    List<TutorSubject> findByTutorIdIn(List<UUID> tutorIds);
}
