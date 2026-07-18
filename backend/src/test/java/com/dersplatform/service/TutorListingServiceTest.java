package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.CreateListingRequest;
import com.dersplatform.model.entity.Subject;
import com.dersplatform.model.entity.TutorListing;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.SubjectRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TutorListingServiceTest {

    @Mock private TutorListingRepository tutorListingRepository;
    @Mock private UserRepository userRepository;
    @Mock private SubjectRepository subjectRepository;
    @Mock private ProfileCompletionService profileCompletionService;

    private TutorListingService tutorListingService;
    private User tutor;
    private Subject subject;
    private String validFiftyWords;

    @BeforeEach
    void setUp() {
        tutorListingService = new TutorListingService(tutorListingRepository, userRepository, subjectRepository,
                profileCompletionService);
        tutor = User.builder().id(UUID.randomUUID()).fullName("Selim Hoca").role(Role.TUTOR).isVerified(true).build();
        subject = Subject.builder().id(UUID.randomUUID()).name("Matematik").build();
        validFiftyWords = "kelime ".repeat(50);
    }

    @Test
    void createListing_ShouldSucceed_WhenValid() {
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.of(subject));
        when(tutorListingRepository.findByTutorIdAndSubjectId(tutor.getId(), subject.getId())).thenReturn(Optional.empty());

        CreateListingRequest request = new CreateListingRequest();
        request.setSubjectId(subject.getId());
        request.setTitle("Boğaziçi Mezunundan YKS Matematik");
        request.setLessonDescription(validFiftyWords);
        request.setAboutTutor(validFiftyWords);
        request.setHourlyRate(BigDecimal.valueOf(500));
        request.setAllowsOnline(true);
        request.setLanguages(List.of("Türkçe", "İngilizce"));

        TutorListing savedListing = TutorListing.builder()
                .id(UUID.randomUUID())
                .tutor(tutor)
                .subject(subject)
                .title(request.getTitle())
                .lessonDescription(request.getLessonDescription())
                .aboutTutor(request.getAboutTutor())
                .hourlyRate(request.getHourlyRate())
                .allowsOnline(request.isAllowsOnline())
                .languages(request.getLanguages())
                .status("ACTIVE")
                .build();

        when(tutorListingRepository.save(any(TutorListing.class))).thenReturn(savedListing);

        var response = tutorListingService.createListing(tutor.getId(), request);

        assertNotNull(response);
        assertEquals("ACTIVE", response.getStatus());
        assertEquals("Matematik", response.getSubjectName());
        assertEquals(BigDecimal.valueOf(500), response.getHourlyRate());
        verify(tutorListingRepository, times(1)).save(any(TutorListing.class));
        verify(profileCompletionService).refresh(tutor);
    }

    @Test
    void createListing_ShouldFail_WhenDescriptionTooShort() {
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.of(subject));

        CreateListingRequest request = new CreateListingRequest();
        request.setSubjectId(subject.getId());
        request.setTitle("Kısa İlan");
        request.setLessonDescription("Kısa açıklama");
        request.setAboutTutor("Kısa hakkımda");
        request.setHourlyRate(BigDecimal.valueOf(500));

        var ex = assertThrows(ApiException.class, () -> tutorListingService.createListing(tutor.getId(), request));
        assertTrue(ex.getMessage().contains("en az 50 kelime"));
    }

    @Test
    void createListing_ShouldFail_WhenContainsContactInfo() {
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.of(subject));

        CreateListingRequest request = new CreateListingRequest();
        request.setSubjectId(subject.getId());
        request.setTitle("İletişimli İlan");
        request.setLessonDescription(validFiftyWords + " test@email.com");
        request.setAboutTutor(validFiftyWords);
        request.setHourlyRate(BigDecimal.valueOf(500));

        var ex = assertThrows(ApiException.class, () -> tutorListingService.createListing(tutor.getId(), request));
        assertTrue(ex.getMessage().contains("İletişim bilgisi"));
    }

    @Test
    void createListing_ShouldFail_WhenListingAlreadyExists() {
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.of(subject));
        when(tutorListingRepository.findByTutorIdAndSubjectId(tutor.getId(), subject.getId()))
                .thenReturn(Optional.of(new TutorListing()));

        CreateListingRequest request = new CreateListingRequest();
        request.setSubjectId(subject.getId());
        request.setTitle("Tekrar İlan");
        request.setLessonDescription(validFiftyWords);
        request.setAboutTutor(validFiftyWords);
        request.setHourlyRate(BigDecimal.valueOf(500));

        assertThrows(ApiException.class, () -> tutorListingService.createListing(tutor.getId(), request));
    }
}
