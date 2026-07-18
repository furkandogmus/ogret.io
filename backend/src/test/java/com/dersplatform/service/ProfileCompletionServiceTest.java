package com.dersplatform.service;

import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.TutorAvailabilityRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.TutorSubjectRepository;
import com.dersplatform.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileCompletionServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TutorSubjectRepository tutorSubjectRepository;
    @Mock private TutorListingRepository tutorListingRepository;
    @Mock private TutorAvailabilityRepository tutorAvailabilityRepository;
    @Mock private EntityManager entityManager;

    @Test
    void tutorUsesTenOperationalCriteriaWithoutEmailOrIdentityVerification() {
        UUID tutorId = UUID.randomUUID();
        User tutor = User.builder()
                .id(tutorId)
                .role(Role.TUTOR)
                .fullName("Deniz Öğretmen")
                .phone("05551234567")
                .avatarUrl("/storage/public-files/avatars/deniz.png")
                .bio("Öğrenci odaklı dersler hazırlıyorum.")
                .education("Matematik lisans mezunu")
                .experienceYears(0)
                .hourlyRate(BigDecimal.valueOf(500))
                .isVerified(false)
                .isIdentityVerified(false)
                .build();
        when(tutorSubjectRepository.existsByTutorId(tutorId)).thenReturn(true);
        when(tutorListingRepository.existsByTutorIdAndStatus(tutorId, "ACTIVE")).thenReturn(true);
        when(tutorAvailabilityRepository.existsByTutorIdAndIsActiveTrue(tutorId)).thenReturn(true);
        when(userRepository.save(tutor)).thenReturn(tutor);

        var result = service().refresh(tutor);

        assertThat(result.getScore()).isEqualTo(100);
        assertThat(result.isComplete()).isTrue();
        assertThat(result.getCompletedItems()).isEqualTo(10);
        assertThat(result.getItems()).extracting("key").containsExactly(
                "fullName", "phone", "avatarUrl", "bio", "education", "experienceYears",
                "hourlyRate", "subjects", "activeListing", "availability");
        assertThat(tutor.isProfileComplete()).isTrue();
        assertThat(tutor.getProfileCompletionScore()).isEqualTo(100);
        verify(userRepository).save(tutor);
    }

    @Test
    void removingAvailabilityImmediatelyMakesTutorIncomplete() {
        UUID tutorId = UUID.randomUUID();
        User tutor = User.builder()
                .id(tutorId)
                .role(Role.TUTOR)
                .fullName("Deniz Öğretmen")
                .phone("05551234567")
                .avatarUrl("/storage/public-files/avatars/deniz.png")
                .bio("Öğrenci odaklı dersler hazırlıyorum.")
                .education("Matematik lisans mezunu")
                .experienceYears(2)
                .hourlyRate(BigDecimal.valueOf(500))
                .isProfileComplete(true)
                .profileCompletionScore(100)
                .build();
        when(tutorSubjectRepository.existsByTutorId(tutorId)).thenReturn(true);
        when(tutorListingRepository.existsByTutorIdAndStatus(tutorId, "ACTIVE")).thenReturn(true);
        when(tutorAvailabilityRepository.existsByTutorIdAndIsActiveTrue(tutorId)).thenReturn(false);
        when(userRepository.save(tutor)).thenReturn(tutor);

        var result = service().refresh(tutor);

        assertThat(result.getScore()).isEqualTo(90);
        assertThat(result.isComplete()).isFalse();
        assertThat(result.getItems()).filteredOn(item -> !item.isCompleted())
                .extracting("key").containsExactly("availability");
        assertThat(tutor.isProfileComplete()).isFalse();
        assertThat(tutor.getProfileCompletionScore()).isEqualTo(90);
    }

    @Test
    void studentUsesOnlyFieldsThatCanBeEditedInTheStudentProfile() {
        User student = User.builder()
                .id(UUID.randomUUID())
                .role(Role.STUDENT)
                .fullName("Ayşe Öğrenci")
                .phone("05550000000")
                .avatarUrl("/storage/public-files/avatars/ayse.png")
                .bio(null)
                .build();

        var result = service().calculate(student);

        assertThat(result.getScore()).isEqualTo(100);
        assertThat(result.isComplete()).isTrue();
        assertThat(result.getItems()).extracting("key")
                .containsExactly("fullName", "phone", "avatarUrl");
    }

    @Test
    void managedNewUserUsesDirtyCheckingInsteadOfASecondSave() {
        User student = User.builder()
                .id(UUID.randomUUID())
                .role(Role.STUDENT)
                .fullName("Yeni Öğrenci")
                .phone("05550000001")
                .build();
        when(entityManager.contains(student)).thenReturn(true);

        var result = service().refresh(student);

        assertThat(result.getScore()).isEqualTo(67);
        assertThat(student.getProfileCompletionScore()).isEqualTo(67);
        verify(userRepository, never()).save(student);
    }

    private ProfileCompletionService service() {
        return new ProfileCompletionService(
                userRepository, tutorSubjectRepository, tutorListingRepository,
                tutorAvailabilityRepository, entityManager);
    }
}
