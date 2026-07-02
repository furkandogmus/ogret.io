package com.dersplatform.service;

import com.dersplatform.model.dto.request.CreateReferenceRequest;
import com.dersplatform.model.dto.response.ReferenceResponse;
import com.dersplatform.model.entity.TutorReference;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.model.enums.VerificationStatus;
import com.dersplatform.repository.TutorReferenceRepository;
import com.dersplatform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TutorReferenceServiceTest {

    @Mock private TutorReferenceRepository tutorReferenceRepository;
    @Mock private UserRepository userRepository;

    private TutorReferenceService tutorReferenceService;
    private User tutor;
    private User student;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        tutorReferenceService = new TutorReferenceService(tutorReferenceRepository, userRepository);

        tutor = User.builder().id(UUID.randomUUID()).fullName("Zeynep Kaya").role(Role.TUTOR).build();
        student = User.builder().id(UUID.randomUUID()).fullName("Ahmet Öğrenci").role(Role.STUDENT).build();
    }

    @Test
    void createReference_ShouldSucceed_whenTutorExists() {
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));

        var reference = TutorReference.builder()
                .id(UUID.randomUUID())
                .tutor(tutor)
                .recommenderName("Ali Demir")
                .recommenderEmail("ali@example.com")
                .recommenderTitle("Eski Öğrencisi")
                .comment("Harika bir öğretmen!")
                .status(VerificationStatus.PENDING)
                .build();

        when(tutorReferenceRepository.save(any(TutorReference.class))).thenReturn(reference);

        var request = new CreateReferenceRequest();
        request.setRecommenderName("Ali Demir");
        request.setRecommenderEmail("ali@example.com");
        request.setRecommenderTitle("Eski Öğrencisi");
        request.setComment("Harika bir öğretmen!");

        ReferenceResponse response = tutorReferenceService.createReference(tutor.getId(), request);

        assertNotNull(response);
        assertEquals("Ali Demir", response.getRecommenderName());
        assertEquals("Eski Öğrencisi", response.getRecommenderTitle());
        assertEquals("Harika bir öğretmen!", response.getComment());
        assertEquals(VerificationStatus.PENDING, response.getStatus());

        verify(tutorReferenceRepository).save(any(TutorReference.class));
    }

    @Test
    void createReference_ShouldThrow_whenNotTutor() {
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));

        var request = new CreateReferenceRequest();
        request.setRecommenderName("Ali Demir");
        request.setRecommenderEmail("ali@example.com");
        request.setRecommenderTitle("Eski Öğrencisi");
        request.setComment("Harika bir öğretmen!");

        assertThrows(RuntimeException.class,
                () -> tutorReferenceService.createReference(student.getId(), request));
    }

    @Test
    void getApprovedReferences_ShouldReturnList() {
        var reference = TutorReference.builder()
                .id(UUID.randomUUID())
                .tutor(tutor)
                .recommenderName("Ali Demir")
                .recommenderTitle("Eski Öğrencisi")
                .comment("Harika!")
                .status(VerificationStatus.APPROVED)
                .build();

        when(tutorReferenceRepository.findByTutorIdAndStatusOrderByCreatedAtDesc(tutor.getId(), VerificationStatus.APPROVED))
                .thenReturn(List.of(reference));

        var list = tutorReferenceService.getApprovedReferences(tutor.getId());

        assertEquals(1, list.size());
        assertEquals("Ali Demir", list.get(0).getRecommenderName());
        assertEquals(VerificationStatus.APPROVED, list.get(0).getStatus());
    }

    @Test
    void updateReferenceStatus_ShouldSucceed() {
        var reference = TutorReference.builder()
                .id(UUID.randomUUID())
                .tutor(tutor)
                .recommenderName("Ali Demir")
                .status(VerificationStatus.PENDING)
                .build();

        when(tutorReferenceRepository.findById(reference.getId())).thenReturn(Optional.of(reference));
        when(tutorReferenceRepository.save(any(TutorReference.class))).thenReturn(reference);

        tutorReferenceService.updateReferenceStatus(reference.getId(), true);

        assertEquals(VerificationStatus.APPROVED, reference.getStatus());
        verify(tutorReferenceRepository).save(reference);
    }
}
