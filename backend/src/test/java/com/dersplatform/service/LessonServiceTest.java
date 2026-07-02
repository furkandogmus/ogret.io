package com.dersplatform.service;

import com.dersplatform.model.dto.request.CreateLessonRequest;
import com.dersplatform.model.dto.response.LessonResponse;
import com.dersplatform.model.entity.Lesson;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.entity.Subject;
import com.dersplatform.model.enums.LessonStatus;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.SubjectRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import java.math.BigDecimal;

@ExtendWith(MockitoExtension.class)
class LessonServiceTest {

    @Mock private LessonRepository lessonRepository;
    @Mock private UserRepository userRepository;
    @Mock private SubjectRepository subjectRepository;
    @Mock private TutorListingRepository tutorListingRepository;
    @Mock private NotificationService notificationService;

    private LessonService lessonService;
    private User student;
    private User tutor;
    private Subject subject;
    private Lesson lesson;
    private CreateLessonRequest createRequest;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        lessonService = new LessonService(lessonRepository, userRepository, subjectRepository, tutorListingRepository, notificationService);

        student = User.builder()
                .id(UUID.randomUUID())
                .fullName("Student")
                .role(Role.STUDENT)
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
                .lessonDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(15, 0))
                .durationMinutes(60)
                .price(BigDecimal.valueOf(300))
                .build();

        createRequest = new CreateLessonRequest();
        createRequest.setTutorId(tutor.getId());
        createRequest.setSubjectId(subject.getId());
        createRequest.setLessonDate(LocalDate.now().plusDays(1));
        createRequest.setStartTime(LocalTime.of(14, 0));
        createRequest.setEndTime(LocalTime.of(15, 0));
    }

    @Test
    void createLesson_ShouldCreatePendingLesson() {
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.of(subject));
        when(lessonRepository.save(any(Lesson.class))).thenReturn(lesson);

        LessonResponse response = lessonService.createLesson(student.getId(), createRequest);

        assertNotNull(response);
        assertEquals(LessonStatus.PENDING, response.getStatus());
        assertEquals(0, BigDecimal.valueOf(300).compareTo(response.getPrice()));
        assertEquals(60, response.getDurationMinutes());

        verify(lessonRepository).save(any(Lesson.class));
    }

    @Test
    void confirmLesson_ShouldUpdateStatus() {
        when(lessonRepository.findById(lesson.getId())).thenReturn(Optional.of(lesson));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));

        LessonResponse response = lessonService.confirmLesson(lesson.getId(), tutor.getId());

        assertEquals(LessonStatus.CONFIRMED, response.getStatus());
    }

    @Test
    void confirmLesson_ShouldThrow_whenNotTutor() {
        UUID wrongUserId = UUID.randomUUID();
        when(lessonRepository.findById(lesson.getId())).thenReturn(Optional.of(lesson));

        assertThrows(RuntimeException.class,
                () -> lessonService.confirmLesson(lesson.getId(), wrongUserId));
    }

    @Test
    void cancelLesson_ShouldUpdateStatus() {
        when(lessonRepository.findById(lesson.getId())).thenReturn(Optional.of(lesson));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));

        LessonResponse response = lessonService.cancelLesson(lesson.getId(), student.getId(), "Müsait değilim");

        assertEquals(LessonStatus.CANCELLED, response.getStatus());
    }

    @Test
    void completeLesson_ShouldUpdateStatus() {
        when(lessonRepository.findById(lesson.getId())).thenReturn(Optional.of(lesson));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));

        LessonResponse response = lessonService.completeLesson(lesson.getId(), tutor.getId());

        assertEquals(LessonStatus.COMPLETED, response.getStatus());
    }

    @Test
    void getStudentLessons_ShouldReturnList() {
        when(lessonRepository.findByStudentIdOrderByCreatedAtDesc(student.getId()))
                .thenReturn(List.of(lesson));

        var lessons = lessonService.getStudentLessons(student.getId());

        assertEquals(1, lessons.size());
    }
}
