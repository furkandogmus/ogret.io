package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.CreateLessonRequest;
import com.dersplatform.model.dto.response.LessonResponse;
import com.dersplatform.model.entity.Lesson;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.entity.Subject;
import com.dersplatform.model.entity.TutorListing;
import com.dersplatform.model.enums.LessonStatus;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.SubjectRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dersplatform.model.entity.TutorAvailability;
import com.dersplatform.repository.TutorAvailabilityRepository;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final TutorListingRepository tutorListingRepository;
    private final TutorAvailabilityRepository tutorAvailabilityRepository;
    private final NotificationService notificationService;
    private final ScoringService scoringService;

    @Transactional
    public LessonResponse createLesson(UUID studentId, CreateLessonRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> ApiException.notFound("Öğrenci bulunamadı"));
        User tutor = userRepository.findById(request.getTutorId())
                .orElseThrow(() -> ApiException.notFound("Öğretmen bulunamadı"));
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> ApiException.notFound("Ders bulunamadı"));

        long minutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (minutes <= 0) {
            throw ApiException.badRequest("Bitiş saati başlangıç saatinden sonra olmalıdır");
        }

        checkTutorAvailability(tutor.getId(), request.getLessonDate(), request.getStartTime(), request.getEndTime());
        checkLessonOverlap(tutor.getId(), request.getLessonDate(), request.getStartTime(), request.getEndTime());

        BigDecimal hourlyRate = tutor.getHourlyRate();
        if (hourlyRate == null) {
            hourlyRate = tutorListingRepository.findByTutorIdAndSubjectId(tutor.getId(), request.getSubjectId())
                    .map(TutorListing::getHourlyRate)
                    .orElse(null);
        }
        if (hourlyRate == null) {
            List<TutorListing> listings = tutorListingRepository.findByTutorId(tutor.getId());
            if (!listings.isEmpty()) {
                hourlyRate = listings.get(0).getHourlyRate();
            }
        }
        if (hourlyRate == null) {
            hourlyRate = BigDecimal.valueOf(300);
        }

        if (tutor.getHourlyRate() == null) {
            tutor.setHourlyRate(hourlyRate);
            userRepository.save(tutor);
        }

        BigDecimal price = hourlyRate.multiply(BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP));

        Lesson lesson = Lesson.builder()
                .student(student)
                .tutor(tutor)
                .subject(subject)
                .status(LessonStatus.PENDING)
                .lessonDate(request.getLessonDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes((int) minutes)
                .price(price)
                .notes(request.getNotes())
                .build();

        lesson = lessonRepository.save(lesson);

        // Notify the tutor about the new lesson request
        notificationService.notifyLessonRequest(student, tutor, subject.getName());

        return LessonResponse.fromEntity(lesson);
    }

    public List<LessonResponse> getStudentLessons(UUID studentId) {
        return lessonRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
                .stream()
                .map(LessonResponse::fromEntity)
                .toList();
    }

    public List<LessonResponse> getTutorLessons(UUID tutorId) {
        return lessonRepository.findByTutorIdOrderByCreatedAtDesc(tutorId)
                .stream()
                .map(LessonResponse::fromEntity)
                .toList();
    }

    @Transactional
    public LessonResponse confirmLesson(UUID lessonId, UUID tutorId) {
        Lesson lesson = lessonRepository.findByIdWithJoins(lessonId)
                .orElseThrow(() -> ApiException.notFound("Ders bulunamadı"));

        if (!lesson.getTutor().getId().equals(tutorId)) {
            throw ApiException.forbidden("Bu dersi yalnızca öğretmen onaylayabilir");
        }

        validateStatusTransition(lesson, LessonStatus.CONFIRMED);
        lesson.setStatus(LessonStatus.CONFIRMED);
        lesson = lessonRepository.save(lesson);

        // Notify the student that their lesson was confirmed
        notificationService.notifyLessonConfirmed(
                lesson.getTutor(), lesson.getStudent(), lesson.getSubject().getName());

        return LessonResponse.fromEntity(lesson);
    }

    @Transactional
    public LessonResponse cancelLesson(UUID lessonId, UUID userId, String reason) {
        Lesson lesson = lessonRepository.findByIdWithJoins(lessonId)
                .orElseThrow(() -> ApiException.notFound("Ders bulunamadı"));

        boolean isStudent = lesson.getStudent().getId().equals(userId);
        boolean isTutor = lesson.getTutor().getId().equals(userId);

        if (!isStudent && !isTutor) {
            throw ApiException.forbidden("Bu dersi iptal etme yetkiniz yok");
        }

        validateStatusTransition(lesson, LessonStatus.CANCELLED);
        lesson.setStatus(LessonStatus.CANCELLED);
        lesson.setStudentCancelled(isStudent);
        lesson.setCancellationReason(reason);
        lesson = lessonRepository.save(lesson);

        // Notify the other party about the cancellation
        User canceller = isStudent ? lesson.getStudent() : lesson.getTutor();
        User otherParty = isStudent ? lesson.getTutor() : lesson.getStudent();
        notificationService.notifyLessonCancelled(
                canceller, otherParty, lesson.getSubject().getName(), isStudent);

        scoringService.recompute(isTutor ? userId : lesson.getTutor().getId());
        return LessonResponse.fromEntity(lesson);
    }

    @Transactional(readOnly = true)
    public LessonResponse getLessonById(UUID lessonId, UUID userId) {
        Lesson lesson = lessonRepository.findByIdWithJoins(lessonId)
                .orElseThrow(() -> ApiException.notFound("Ders bulunamadı"));

        boolean isStudent = lesson.getStudent().getId().equals(userId);
        boolean isTutor = lesson.getTutor().getId().equals(userId);
        if (!isStudent && !isTutor) {
            throw ApiException.forbidden("Bu derse erişim yetkiniz yok");
        }

        return LessonResponse.fromEntity(lesson);
    }

    @Transactional
    public LessonResponse updateMeetingLink(UUID lessonId, UUID tutorId, String meetingLink) {
        Lesson lesson = lessonRepository.findByIdWithJoins(lessonId)
                .orElseThrow(() -> ApiException.notFound("Ders bulunamadı"));

        if (!lesson.getTutor().getId().equals(tutorId)) {
            throw ApiException.forbidden("Meeting linkini yalnızca öğretmen güncelleyebilir");
        }

        lesson.setMeetingLink(meetingLink);
        lesson = lessonRepository.save(lesson);
        return LessonResponse.fromEntity(lesson);
    }

    @Transactional
    public LessonResponse completeLesson(UUID lessonId, UUID tutorId) {
        Lesson lesson = lessonRepository.findByIdWithJoins(lessonId)
                .orElseThrow(() -> ApiException.notFound("Ders bulunamadı"));

        if (!lesson.getTutor().getId().equals(tutorId)) {
            throw ApiException.forbidden("Bu dersi yalnızca öğretmen tamamlayabilir");
        }

        validateStatusTransition(lesson, LessonStatus.COMPLETED);
        lesson.setStatus(LessonStatus.COMPLETED);
        lesson = lessonRepository.save(lesson);

        // Notify the student that the lesson is completed
        notificationService.notifyLessonCompleted(
                lesson.getTutor(), lesson.getStudent(), lesson.getSubject().getName());

        scoringService.recompute(tutorId);
        return LessonResponse.fromEntity(lesson);
    }

    private void validateStatusTransition(Lesson lesson, LessonStatus target) {
        LessonStatus current = lesson.getStatus();
        boolean valid = switch (current) {
            case PENDING -> target == LessonStatus.CONFIRMED || target == LessonStatus.CANCELLED;
            case CONFIRMED -> target == LessonStatus.COMPLETED || target == LessonStatus.CANCELLED;
            case IN_PROGRESS -> target == LessonStatus.COMPLETED || target == LessonStatus.CANCELLED;
            default -> false;
        };
        if (!valid) {
            throw ApiException.badRequest(
                "Ders durumu '" + current + "' iken '" + target + "' durumuna geçirilemez"
            );
        }
    }

    private void checkTutorAvailability(UUID tutorId, java.time.LocalDate date,
                                          java.time.LocalTime start, java.time.LocalTime end) {
        List<TutorAvailability> slots = tutorAvailabilityRepository
                .findByTutorIdAndIsActiveTrue(tutorId);
        if (slots.isEmpty()) return;

        int dayOfWeek = date.getDayOfWeek().getValue() % 7;
        boolean available = slots.stream()
                .anyMatch(s -> s.getDayOfWeek().equals(dayOfWeek)
                        && !s.getStartTime().isAfter(start)
                        && !s.getEndTime().isBefore(end));
        if (!available) {
            throw ApiException.badRequest("Öğretmen bu tarih ve saat aralığında müsait değil");
        }
    }

    private void checkLessonOverlap(UUID tutorId, java.time.LocalDate date,
                                     java.time.LocalTime start, java.time.LocalTime end) {
        if (lessonRepository.existsOverlappingLesson(tutorId, date, start, end)) {
            throw ApiException.conflict("Bu saat aralığında öğretmenin başka bir dersi var");
        }
    }
}
