package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.CreateReviewRequest;
import com.dersplatform.model.dto.response.ReviewResponse;
import com.dersplatform.model.entity.Lesson;
import com.dersplatform.model.entity.Review;
import com.dersplatform.model.enums.LessonStatus;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.ReviewRepository;
import com.dersplatform.repository.UserRepository;
import com.dersplatform.model.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final TutorService tutorService;
    private final NotificationService notificationService;

    @Transactional
    public ReviewResponse createReview(UUID studentId, CreateReviewRequest request) {
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> ApiException.notFound("Ders bulunamadı"));

        if (!lesson.getStudent().getId().equals(studentId)) {
            throw ApiException.forbidden("Bu derse yalnızca öğrenci yorum yapabilir");
        }

        if (lesson.getStatus() != LessonStatus.COMPLETED) {
            throw ApiException.badRequest("Yalnızca tamamlanmış derslere yorum yapılabilir");
        }

        if (reviewRepository.existsByLessonId(request.getLessonId())) {
            throw ApiException.conflict("Bu derse zaten yorum yapılmış");
        }

        Review review = Review.builder()
                .lesson(lesson)
                .student(lesson.getStudent())
                .tutor(lesson.getTutor())
                .rating(request.getRating())
                .comment(request.getComment())
                .isAnonymous(request.isAnonymous())
                .build();

        review = reviewRepository.save(review);
        UUID tutorId = lesson.getTutor().getId();
        updateTutorRating(tutorId);
        tutorService.computePopularityScore(tutorId);

        // Notify the tutor about the new review
        notificationService.notifyNewReview(lesson.getStudent(), lesson.getTutor(), request.getRating());

        return ReviewResponse.fromEntity(review);
    }

    public List<ReviewResponse> getStudentReviews(UUID studentId) {
        return reviewRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
                .stream()
                .map(ReviewResponse::fromEntity)
                .toList();
    }

    public List<ReviewResponse> getTutorReviews(UUID tutorId) {
        return reviewRepository.findByTutorIdOrderByCreatedAtDesc(tutorId)
                .stream()
                .map(ReviewResponse::fromEntity)
                .toList();
    }

    private void updateTutorRating(UUID tutorId) {
        List<Review> reviews = reviewRepository.findByTutorIdOrderByCreatedAtDesc(tutorId);
        if (reviews.isEmpty()) return;

        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0);

        User tutor = reviews.get(0).getTutor();
        tutor.setRatingAvg(BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP));
        tutor.setRatingCount(reviews.size());
        userRepository.save(tutor);
    }
}
