package com.dersplatform.service;

import com.dersplatform.model.dto.request.CreateLessonRequest;
import com.dersplatform.model.dto.response.LessonResponse;
import com.dersplatform.model.entity.Lesson;
import com.dersplatform.model.entity.TutorAvailability;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.entity.Subject;
import com.dersplatform.model.enums.LessonStatus;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.SubjectRepository;
import com.dersplatform.repository.TutorAvailabilityRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.UserRepository;
import com.dersplatform.repository.MessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LessonServiceTest {

    private static final Clock FIXED_CLOCK = Clock.fixed(
            Instant.parse("2026-07-19T07:00:00Z"), ZoneId.of("Europe/Istanbul"));

    @Mock private LessonRepository lessonRepository;
    @Mock private UserRepository userRepository;
    @Mock private SubjectRepository subjectRepository;
    @Mock private TutorListingRepository tutorListingRepository;
    @Mock private NotificationService notificationService;
    @Mock private TutorAvailabilityRepository tutorAvailabilityRepository;
    @Mock private MessageRepository messageRepository;
    @Mock private ScoringService scoringService;

    private LessonService lessonService;
    private User student;
    private User tutor;
    private Subject subject;
    private Lesson lesson;
    private CreateLessonRequest createRequest;

    @BeforeEach
    void setUp() {
        lessonService = new LessonService(
                lessonRepository,
                userRepository,
                subjectRepository,
                tutorListingRepository,
                tutorAvailabilityRepository,
                messageRepository,
                notificationService,
                scoringService,
                FIXED_CLOCK);

        student = User.builder()
                .id(UUID.randomUUID())
                .fullName("Student")
                .role(Role.STUDENT)
                .isVerified(true)
                .build();

        tutor = User.builder()
                .id(UUID.randomUUID())
                .fullName("Tutor")
                .role(Role.TUTOR)
                .hourlyRate(BigDecimal.valueOf(300))
                .build();

        subject = Subject.builder()
                .id(UUID.randomUUID())
                .name("Matematik")
                .build();

        lesson = Lesson.builder()
                .id(UUID.randomUUID())
                .student(student)
                .tutor(tutor)
                .subject(subject)
                .status(LessonStatus.PENDING)
                .lessonDate(LocalDate.of(2026, 7, 20))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(15, 0))
                .durationMinutes(60)
                .price(BigDecimal.valueOf(300))
                .build();

        createRequest = new CreateLessonRequest();
        createRequest.setTutorId(tutor.getId());
        createRequest.setSubjectId(subject.getId());
        createRequest.setLessonDate(LocalDate.of(2026, 7, 20));
        createRequest.setStartTime(LocalTime.of(14, 0));
        createRequest.setEndTime(LocalTime.of(15, 0));
    }

    @Test
    void createLesson_ShouldCreatePendingLesson() {
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.of(subject));
        when(tutorAvailabilityRepository.findByTutorIdAndIsActiveTrue(tutor.getId()))
                .thenReturn(List.of(availabilityForRequest()));
        when(lessonRepository.save(any(Lesson.class))).thenReturn(lesson);

        LessonResponse response = lessonService.createLesson(student.getId(), createRequest);

        assertNotNull(response);
        assertEquals(LessonStatus.PENDING, response.getStatus());
        assertEquals(0, BigDecimal.valueOf(300).compareTo(response.getPrice()));
        assertEquals(60, response.getDurationMinutes());

        verify(lessonRepository).save(any(Lesson.class));
    }

    @Test
    void createLesson_ShouldRejectWhenTutorHasNoAvailability() {
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.of(subject));
        when(tutorAvailabilityRepository.findByTutorIdAndIsActiveTrue(tutor.getId())).thenReturn(List.of());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> lessonService.createLesson(student.getId(), createRequest));

        assertEquals("Öğretmen henüz müsaitlik takvimi oluşturmadı", exception.getMessage());
        verify(lessonRepository, never()).save(any(Lesson.class));
        verify(messageRepository, never()).save(any());
    }

    @Test
    void confirmLesson_ShouldUpdateStatus() {
        when(lessonRepository.findByIdWithJoins(lesson.getId())).thenReturn(Optional.of(lesson));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        LessonResponse response = lessonService.confirmLesson(lesson.getId(), tutor.getId());

        assertEquals(LessonStatus.CONFIRMED, response.getStatus());
    }

    @Test
    void confirmLesson_ShouldThrow_whenNotTutor() {
        UUID wrongUserId = UUID.randomUUID();
        when(lessonRepository.findByIdWithJoins(lesson.getId())).thenReturn(Optional.of(lesson));

        assertThrows(RuntimeException.class,
                () -> lessonService.confirmLesson(lesson.getId(), wrongUserId));
    }

    @Test
    void cancelLesson_ShouldUpdateStatus() {
        when(lessonRepository.findByIdWithJoins(lesson.getId())).thenReturn(Optional.of(lesson));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        LessonResponse response = lessonService.cancelLesson(lesson.getId(), student.getId(), "Müsait değilim");

        assertEquals(LessonStatus.CANCELLED, response.getStatus());
    }

    @Test
    void completeLesson_ShouldUpdateStatus() {
        lesson.setStatus(LessonStatus.CONFIRMED);
        when(lessonRepository.findByIdWithJoins(lesson.getId())).thenReturn(Optional.of(lesson));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        LessonResponse response = lessonService.completeLesson(lesson.getId(), tutor.getId());

        assertEquals(LessonStatus.COMPLETED, response.getStatus());
    }

    @Test
    void startLesson_ShouldMoveConfirmedLessonToInProgress() {
        lesson.setStatus(LessonStatus.CONFIRMED);
        when(lessonRepository.findByIdWithJoins(lesson.getId())).thenReturn(Optional.of(lesson));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LessonResponse response = lessonService.startLesson(lesson.getId(), tutor.getId());

        assertEquals(LessonStatus.IN_PROGRESS, response.getStatus());
    }

    @Test
    void createLesson_ShouldRejectPastStartTimeBeforeDatabaseWork() {
        createRequest.setLessonDate(LocalDate.of(2026, 7, 19));
        createRequest.setStartTime(LocalTime.of(9, 59));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> lessonService.createLesson(student.getId(), createRequest));

        assertEquals("Ders başlangıç zamanı gelecekte olmalıdır", exception.getMessage());
        verifyNoInteractions(userRepository, subjectRepository, lessonRepository);
    }

    @Test
    void getStudentLessons_ShouldReturnList() {
        when(lessonRepository.findByStudentIdOrderByCreatedAtDesc(student.getId()))
                .thenReturn(List.of(lesson));

        var lessons = lessonService.getStudentLessons(student.getId());

        assertEquals(1, lessons.size());
    }

    private TutorAvailability availabilityForRequest() {
        return TutorAvailability.builder()
                .tutor(tutor)
                .dayOfWeek(createRequest.getLessonDate().getDayOfWeek().getValue() - 1)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(18, 0))
                .isActive(true)
                .build();
    }
}
