package com.dersplatform.config;

import com.dersplatform.model.entity.TutorAvailability;
import com.dersplatform.model.entity.TutorListing;
import com.dersplatform.model.entity.TutorSubject;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.SubjectRepository;
import com.dersplatform.repository.TutorAvailabilityRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.TutorSubjectRepository;
import com.dersplatform.repository.UserRepository;
import com.dersplatform.service.TutorService;
import com.dersplatform.service.ProfileCompletionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalTime;
import java.util.List;

/**
 * Creates a small, deterministic workspace for the zero-configuration Docker
 * experience. The dev profile is the safety boundary: none of these accounts
 * are created when the production profile is active.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class AppSeeder implements CommandLineRunner {

    @Value("${app.bootstrap.admin-password:123456}")
    private String adminBootstrapPassword;

    @Value("${app.bootstrap.demo-password:123456}")
    private String demoBootstrapPassword;

    @Value("${app.bootstrap.apply-passwords:false}")
    private boolean applyBootstrapPasswords;

    @Value("${app.bootstrap.marker-file:}")
    private String bootstrapMarkerFile;

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final TutorSubjectRepository tutorSubjectRepository;
    private final TutorAvailabilityRepository tutorAvailabilityRepository;
    private final TutorListingRepository tutorListingRepository;
    private final PasswordEncoder passwordEncoder;
    private final TutorService tutorService;
    private final ProfileCompletionService profileCompletionService;

    @Override
    @Transactional
    public void run(String... args) {
        User admin = seedUser(
                "admin@ogret.io",
                "5550000001",
                "Admin Kullanıcı",
                Role.ADMIN,
                null,
                null,
                null);

        User tutor = seedUser(
                "zeynep@ogret.io",
                "5550000002",
                "Zeynep Kaya",
                Role.TUTOR,
                "Matematik konularını sade ve anlaşılır örneklerle anlatıyorum.",
                "Boğaziçi Üniversitesi, Matematik Bölümü",
                new BigDecimal("350.00"));

        User student = seedUser(
                "ahmet@ogret.io",
                "5550000005",
                "Ahmet Öğrenci",
                Role.STUDENT,
                null,
                null,
                null);

        seedTutorWorkspace(tutor);
        profileCompletionService.refresh(admin);
        profileCompletionService.refresh(tutor);
        profileCompletionService.refresh(student);
        tutorService.computePopularityScore(tutor.getId());
        markBootstrapAppliedAfterCommit();

        log.info("Development accounts are ready. For initial Docker credentials run: "
                + "docker compose exec backend show-bootstrap-credentials");
    }

    private User seedUser(
            String email,
            String phone,
            String fullName,
            Role role,
            String bio,
            String education,
            BigDecimal hourlyRate) {
        var existingUser = userRepository.findByEmail(email);
        User user = existingUser.orElseGet(User::new);

        user.setEmail(email);
        user.setPhone(phone);
        boolean rotateExistingPassword = existingUser.isPresent() && applyBootstrapPasswords;
        if (existingUser.isEmpty() || rotateExistingPassword
                || user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            String bootstrapPassword = role == Role.ADMIN
                    ? adminBootstrapPassword
                    : demoBootstrapPassword;
            user.setPasswordHash(passwordEncoder.encode(bootstrapPassword));
            if (rotateExistingPassword) {
                user.setTokenVersion((user.getTokenVersion() == null ? 0 : user.getTokenVersion()) + 1);
            }
        }
        user.setFullName(fullName);
        user.setRole(role);
        user.setVerified(true);
        user.setTokenVersion(user.getTokenVersion() == null ? 0 : user.getTokenVersion());
        user.setProfileComplete(false);
        user.setBio(bio);
        user.setEducation(education);
        user.setExperienceYears(role == Role.TUTOR ? 8 : null);
        user.setHourlyRate(hourlyRate);
        user.setRatingAvg(role == Role.TUTOR ? new BigDecimal("4.9") : BigDecimal.ZERO);
        user.setRatingCount(role == Role.TUTOR ? 12 : 0);
        user.setOnline(false);
        user.setIdentityVerified(role == Role.TUTOR || role == Role.ADMIN);

        return userRepository.save(user);
    }

    private void markBootstrapAppliedAfterCommit() {
        if (!applyBootstrapPasswords || bootstrapMarkerFile == null || bootstrapMarkerFile.isBlank()) {
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                try {
                    Path marker = Path.of(bootstrapMarkerFile);
                    Files.createDirectories(marker.getParent());
                    Files.writeString(marker, "applied\n",
                            StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                } catch (Exception exception) {
                    log.error("Bootstrap credential marker could not be persisted", exception);
                }
            }
        });
    }

    private void seedTutorWorkspace(User tutor) {
        var subject = subjectRepository.findBySlug("matematik")
                .orElseThrow(() -> new IllegalStateException("Development subject seed is missing: matematik"));

        boolean hasSubject = tutorSubjectRepository.findByTutorId(tutor.getId()).stream()
                .anyMatch(item -> item.getSubject().getId().equals(subject.getId()));
        if (!hasSubject) {
            tutorSubjectRepository.save(TutorSubject.builder()
                    .tutor(tutor)
                    .subject(subject)
                    .description("TYT, AYT ve lise matematiği")
                    .hourlyRate(new BigDecimal("350.00"))
                    .build());
        }

        if (tutorListingRepository.findByTutorIdAndSubjectId(tutor.getId(), subject.getId()).isEmpty()) {
            tutorListingRepository.save(TutorListing.builder()
                    .tutor(tutor)
                    .subject(subject)
                    .title("Matematiği birlikte anlaşılır hale getirelim")
                    .lessonDescription("Konu anlatımı, soru çözümü ve sınav hazırlığını öğrencinin seviyesine göre planlarız.")
                    .aboutTutor("Sekiz yıllık ders deneyimimle düzenli ve takip edilebilir bir çalışma programı sunuyorum.")
                    .hourlyRate(new BigDecimal("350.00"))
                    .allowsTutorHome(false)
                    .allowsStudentHome(false)
                    .allowsOnline(true)
                    .experienceYears(8)
                    .languages(List.of("Türkçe"))
                    .status("ACTIVE")
                    .build());
        }

        if (tutorAvailabilityRepository.findByTutorId(tutor.getId()).isEmpty()) {
            for (int day = 0; day < 5; day++) {
                tutorAvailabilityRepository.save(TutorAvailability.builder()
                        .tutor(tutor)
                        .dayOfWeek(day)
                        .startTime(LocalTime.of(9, 0))
                        .endTime(LocalTime.of(18, 0))
                        .isActive(true)
                        .build());
            }
        }
    }
}
