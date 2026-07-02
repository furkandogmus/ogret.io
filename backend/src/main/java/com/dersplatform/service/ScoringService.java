package com.dersplatform.service;

import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.ReviewRepository;
import com.dersplatform.repository.SubscriptionRepository;
import com.dersplatform.repository.TutorSubjectRepository;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScoringService {

    private static final Logger log = LoggerFactory.getLogger(ScoringService.class);

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final ReviewRepository reviewRepository;
    private final TutorSubjectRepository tutorSubjectRepository;
    private final SubscriptionRepository subscriptionRepository;

    private static final double BAYESIAN_GLOBAL_AVG = 4.5;
    private static final double BAYESIAN_MIN_REVIEWS = 10;
    private static final double NEW_TUTOR_BOOST_DAYS = 30;

    @Transactional
    public void recompute(UUID tutorId) {
        userRepository.findById(tutorId).ifPresent(tutor -> {
            if (tutor.getRole() != Role.TUTOR) return;
            double score = computeScore(tutor);
            if (tutor.getPopularityScore() == null
                    || BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP)
                    .compareTo(tutor.getPopularityScore()) != 0) {
                tutor.setPopularityScore(BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP));
                userRepository.save(tutor);
            }
        });
    }

    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void recomputeAll() {
        log.info("Starting periodic popularity score recomputation for all tutors");
        List<User> tutors = userRepository.findByRole(Role.TUTOR);
        for (User tutor : tutors) {
            recompute(tutor.getId());
        }
        log.info("Completed periodic score recomputation for {} tutors", tutors.size());
    }

    private double computeScore(User tutor) {
        UUID id = tutor.getId();

        double ratingScore = computeRatingScore(id);
        double reviewCountScore = computeReviewCountScore(id);
        double completionScore = computeCompletionScore(id);
        double profileScore = computeProfileScore(tutor);
        double experienceScore = computeExperienceScore(tutor);
        double recencyScore = computeRecencyScore(id);
        double newTutorBoost = computeNewTutorBoost(tutor);
        double verifiedBonus = tutor.isIdentityVerified() ? 5 : 0;

        double base = ratingScore + reviewCountScore + completionScore + profileScore
                + experienceScore + recencyScore + newTutorBoost + verifiedBonus;

        double multiplier = computeSubscriptionMultiplier(id);

        return Math.min(base * multiplier, 100.0);
    }

    private double computeRatingScore(UUID tutorId) {
        var reviews = reviewRepository.findByTutorIdOrderByCreatedAtDesc(tutorId);
        if (reviews.isEmpty()) return 0;

        double avg = reviews.stream().mapToInt(r -> r.getRating()).average().orElse(0);
        int count = reviews.size();

        double bayesian = (avg * count + BAYESIAN_GLOBAL_AVG * BAYESIAN_MIN_REVIEWS)
                / (count + BAYESIAN_MIN_REVIEWS);

        return (bayesian / 5.0) * 25;
    }

    private double computeReviewCountScore(UUID tutorId) {
        int count = reviewRepository.findByTutorIdOrderByCreatedAtDesc(tutorId).size();
        return Math.min(Math.log10(count + 1) / Math.log10(101), 1.0) * 10;
    }

    private double computeCompletionScore(UUID tutorId) {
        long resolved = lessonRepository.countResolvedByTutorId(tutorId);
        if (resolved == 0) return 0;

        long completed = lessonRepository.countCompletedByTutorId(tutorId);
        double rate = (double) completed / resolved;

        BigDecimal rateBD = BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP);
        userRepository.findById(tutorId).ifPresent(u -> {
            u.setLessonCompletionRate(rateBD);
            userRepository.save(u);
        });

        return rate * 15;
    }

    private double computeProfileScore(User tutor) {
        int score = 0;
        if (tutor.getAvatarUrl() != null && !tutor.getAvatarUrl().isBlank()) score += 20;
        if (tutor.getBio() != null && !tutor.getBio().isBlank()) {
            int len = tutor.getBio().length();
            if (len >= 200) score += 20;
            else if (len >= 100) score += 15;
            else score += 10;
        }
        if (tutor.getEducation() != null && !tutor.getEducation().isBlank()) score += 15;
        if (tutor.getHourlyRate() != null && tutor.getHourlyRate().compareTo(BigDecimal.ZERO) > 0) score += 10;
        if (!tutorSubjectRepository.findByTutorId(tutor.getId()).isEmpty()) score += 20;
        if (tutor.getExperienceYears() != null && tutor.getExperienceYears() > 0) score += 15;

        score = Math.min(score, 100);
        tutor.setProfileCompletionScore(score);

        return (score / 100.0) * 15;
    }

    private double computeExperienceScore(User tutor) {
        if (tutor.getExperienceYears() == null || tutor.getExperienceYears() <= 0) return 0;
        double normalized = Math.min(tutor.getExperienceYears() / 20.0, 1.0);
        return normalized * 10;
    }

    private double computeRecencyScore(UUID tutorId) {
        if (userRepository.findById(tutorId).map(User::isOnline).orElse(false)) {
            return 10;
        }

        LocalDate lastLesson = lessonRepository.findLastLessonDateByTutorId(tutorId);
        if (lastLesson == null) return 2;

        long monthsSince = ChronoUnit.MONTHS.between(lastLesson, LocalDate.now());
        if (monthsSince <= 1) return 10;
        if (monthsSince <= 3) return 7;
        if (monthsSince <= 6) return 4;
        if (monthsSince <= 12) return 2;
        return 0;
    }

    private double computeNewTutorBoost(User tutor) {
        long daysSinceCreation = ChronoUnit.DAYS.between(tutor.getCreatedAt(), LocalDateTime.now());
        if (daysSinceCreation > NEW_TUTOR_BOOST_DAYS) return 0;

        double boost = (1.0 - daysSinceCreation / NEW_TUTOR_BOOST_DAYS) * 5;
        return Math.max(boost, 0);
    }

    private double computeSubscriptionMultiplier(UUID tutorId) {
        var sub = subscriptionRepository.findByTutorIdAndIsActiveTrue(tutorId);
        if (sub.isEmpty()) return 1.0;
        return switch (sub.get().getPlanType()) {
            case VIP -> 1.2;
            case PREMIUM -> 1.1;
            case BASIC -> 1.05;
        };
    }
}
