package com.dersplatform.service;

import com.dersplatform.model.dto.request.CreateReviewRequest;
import com.dersplatform.model.dto.response.ReviewResponse;
import com.dersplatform.model.entity.Lesson;
import com.dersplatform.model.entity.Review;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.entity.Subject;
import com.dersplatform.model.enums.LessonStatus;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.ReviewRepository;
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

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

        @Mock
        private ReviewRepository reviewRepository;
        @Mock
        private LessonRepository lessonRepository;
        @Mock
        private UserRepository userRepository;
        @Mock
        private TutorService tutorService;
        @Mock
        private NotificationService notificationService;

        private ReviewService reviewService;
        private User student;
        private User tutor;
        private Lesson completedLesson;
        private Lesson pendingLesson;

        @BeforeEach
        void setUp() {
                MockitoAnnotations.openMocks(this);
                reviewService = new ReviewService(reviewRepository, lessonRepository, userRepository, tutorService,
                                notificationService);

                student = User.builder().id(UUID.randomUUID()).fullName("Student").role(Role.STUDENT).build();
                tutor = User.builder().id(UUID.randomUUID()).fullName("Tutor").role(Role.TUTOR).build();

                var subject = Subject.builder().id(UUID.randomUUID()).name("Matematik").build();

                completedLesson = Lesson.builder()
                                .id(UUID.randomUUID())
                                .student(student)
                                .tutor(tutor)
                                .subject(subject)
                                .status(LessonStatus.COMPLETED)
                                .lessonDate(LocalDate.now())
                                .startTime(LocalTime.of(14, 0))
                                .endTime(LocalTime.of(15, 0))
                                .durationMinutes(60)
                                .price(BigDecimal.valueOf(300))
                                .build();

                pendingLesson = Lesson.builder()
                                .id(UUID.randomUUID())
                                .student(student)
                                .tutor(tutor)
                                .subject(subject)
                                .status(LessonStatus.PENDING)
                                .build();
        }

        @Test
        void createReview_ShouldSucceed_whenLessonCompleted() {
                when(lessonRepository.findById(completedLesson.getId())).thenReturn(Optional.of(completedLesson));
                when(reviewRepository.existsByLessonId(completedLesson.getId())).thenReturn(false);

                var review = Review.builder()
                                .id(UUID.randomUUID())
                                .lesson(completedLesson)
                                .student(student)
                                .tutor(tutor)
                                .rating(5)
                                .comment("Harika!")
                                .build();

                when(reviewRepository.save(any(Review.class))).thenReturn(review);

                var request = new CreateReviewRequest();
                request.setLessonId(completedLesson.getId());
                request.setRating(5);
                request.setComment("Harika!");

                ReviewResponse response = reviewService.createReview(student.getId(), request);

                assertNotNull(response);
                assertEquals(5, response.getRating());
                assertEquals("Harika!", response.getComment());

                verify(reviewRepository).save(any(Review.class));
        }

        @Test
        void createReview_ShouldThrow_whenLessonNotCompleted() {
                when(lessonRepository.findById(pendingLesson.getId())).thenReturn(Optional.of(pendingLesson));

                var request = new CreateReviewRequest();
                request.setLessonId(pendingLesson.getId());
                request.setRating(5);

                assertThrows(RuntimeException.class,
                                () -> reviewService.createReview(student.getId(), request));
        }

        @Test
        void createReview_ShouldThrow_whenNotStudent() {
                UUID wrongUserId = UUID.randomUUID();
                when(lessonRepository.findById(completedLesson.getId())).thenReturn(Optional.of(completedLesson));

                var request = new CreateReviewRequest();
                request.setLessonId(completedLesson.getId());
                request.setRating(5);

                assertThrows(RuntimeException.class,
                                () -> reviewService.createReview(wrongUserId, request));
        }

        @Test
        void getTutorReviews_ShouldReturnList() {
                var review = Review.builder()
                                .id(UUID.randomUUID())
                                .lesson(completedLesson)
                                .student(student)
                                .tutor(tutor)
                                .rating(4)
                                .comment("İyi")
                                .build();

                when(reviewRepository.findByTutorIdOrderByCreatedAtDesc(tutor.getId()))
                                .thenReturn(List.of(review));

                var reviews = reviewService.getTutorReviews(tutor.getId());

                assertEquals(1, reviews.size());
                assertEquals(4, reviews.get(0).getRating());
        }
}
