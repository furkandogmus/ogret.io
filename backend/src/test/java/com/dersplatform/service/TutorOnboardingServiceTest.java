package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
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
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TutorOnboardingServiceTest {

    private static final TutorListing MOCK_LISTING = TutorListing.builder().id(UUID.randomUUID()).build();

    @Mock private UserRepository userRepository;
    @Mock private SubjectRepository subjectRepository;
    @Mock private TutorListingRepository tutorListingRepository;

    private TutorOnboardingService onboardingService;
    private User tutor;
    private User incompleteTutor;
    private Subject subject;

    @BeforeEach
    void setUp() {
        onboardingService = new TutorOnboardingService(userRepository, subjectRepository, tutorListingRepository);

        subject = Subject.builder()
                .id(UUID.randomUUID())
                .name("Matematik")
                .build();

        tutor = User.builder()
                .id(UUID.randomUUID())
                .fullName("Ahmet Hoca")
                .phone("5551234567")
                .role(Role.TUTOR)
                .bio("Deneyimli matematik öğretmeni")
                .education("ODTÜ Matematik")
                .hourlyRate(BigDecimal.valueOf(500))
                .experienceYears(10)
                .avatarUrl("https://example.com/avatar.jpg")
                .isIdentityVerified(true)
                .build();

        incompleteTutor = User.builder()
                .id(UUID.randomUUID())
                .fullName("")
                .phone("")
                .role(Role.TUTOR)
                .build();
    }

    @Test
    void getProgress_WithCompleteProfile_ShouldReturn100Percent() {
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(tutorListingRepository.findByTutorIdAndStatusOrderByCreatedAtDesc(tutor.getId(), "ACTIVE"))
                .thenReturn(List.of(MOCK_LISTING));

        Map<String, Object> progress = onboardingService.getProgress(tutor.getId());

        assertEquals(100, progress.get("percentage"));
    }

    @Test
    void getProgress_WithIncompleteProfile_ShouldReturnLowerPercent() {
        when(userRepository.findById(incompleteTutor.getId())).thenReturn(Optional.of(incompleteTutor));
        when(tutorListingRepository.findByTutorIdAndStatusOrderByCreatedAtDesc(incompleteTutor.getId(), "ACTIVE"))
                .thenReturn(List.of());

        Map<String, Object> progress = onboardingService.getProgress(incompleteTutor.getId());

        assertTrue((Integer) progress.get("percentage") < 100);
    }

    @Test
    void getProgress_ShouldThrow_whenUserIsStudent() {
        User student = User.builder().id(UUID.randomUUID()).role(Role.STUDENT).build();
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));

        assertThrows(ApiException.class, () -> onboardingService.getProgress(student.getId()));
    }

    @Test
    void getProgress_ShouldThrow_whenUserNotFound() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ApiException.class, () -> onboardingService.getProgress(id));
    }

    @Test
    void updateStep1_ShouldUpdateFields() {
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = onboardingService.updateStep1(tutor.getId(), "Ahmet Yeni", "5559999999", "Yeni bio", "Yeni okul");

        assertEquals("Ahmet Yeni", result.getFullName());
        assertEquals("5559999999", result.getPhone());
        assertEquals("Yeni bio", result.getBio());
        assertEquals("Yeni okul", result.getEducation());
    }

    @Test
    void updateStep2_ShouldUpdateRates() {
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = onboardingService.updateStep2(tutor.getId(), BigDecimal.valueOf(600), 12);

        assertEquals(600, result.getHourlyRate().intValue());
        assertEquals(12, result.getExperienceYears());
    }

    @Test
    void createListing_ShouldCreateActiveListing() {
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.of(subject));
        when(tutorListingRepository.save(any(TutorListing.class))).thenAnswer(i -> i.getArgument(0));

        TutorListing result = onboardingService.createListing(
                tutor.getId(), subject.getId(), "Matematik Dersi",
                "Ders açıklaması", "Hakkımda", true);

        assertEquals("ACTIVE", result.getStatus());
        assertEquals("Matematik Dersi", result.getTitle());
        verify(tutorListingRepository).save(any(TutorListing.class));
    }

    @Test
    void createListing_ShouldThrow_whenSubjectNotFound() {
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.empty());

        assertThrows(ApiException.class,
                () -> onboardingService.createListing(tutor.getId(), subject.getId(),
                        "Ders", "Açıklama", "Hakkımda", true));
    }
}
