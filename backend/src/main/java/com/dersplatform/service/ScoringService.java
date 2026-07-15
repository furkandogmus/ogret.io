package com.dersplatform.service;

import com.dersplatform.model.entity.TutorSubject;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.model.enums.VerificationStatus;
import com.dersplatform.repository.FavoriteTutorRepository;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.ReviewRepository;
import com.dersplatform.repository.SubscriptionRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.TutorReferenceRepository;
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
    private final FavoriteTutorRepository favoriteTutorRepository;
    private final TutorReferenceRepository tutorReferenceRepository;
    private final TutorListingRepository tutorListingRepository;

    private static final double BAYESIAN_GLOBAL_AVG = 4.5;
    private static final double BAYESIAN_MIN_REVIEWS = 10;
    private static final double NEW_TUTOR_BOOST_DAYS = 30;

    @Transactional
    public void recompute(UUID tutorId) {
        recompute(tutorId, null);
    }

    @Transactional
    public void recompute(UUID tutorId, List<TutorSubject> preloadedSubjects) {
        userRepository.findById(tutorId).ifPresent(tutor -> {
            if (tutor.getRole() != Role.TUTOR)
                return;
            double score = computeScore(tutor, preloadedSubjects);
            BigDecimal newScore = BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP);
            if (tutor.getPopularityScore() == null || newScore.compareTo(tutor.getPopularityScore()) != 0) {
                tutor.setPopularityScore(newScore);
                userRepository.save(tutor);
            }
        });
    }

    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void recomputeAll() {
        log.info("Starting periodic popularity score recomputation for all tutors");
        List<User> tutors = userRepository.findByRole(Role.TUTOR);
        List<UUID> tutorIds = tutors.stream().map(User::getId).toList();

        var subjectsByTutor = tutorSubjectRepository.findByTutorIdIn(tutorIds)
                .stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        ts -> ts.getTutor().getId(),
                        java.util.stream.Collectors.toList()));

        for (User tutor : tutors) {
            var subjects = subjectsByTutor.getOrDefault(tutor.getId(), List.of());
            recompute(tutor.getId(), subjects);
        }
        log.info("Completed periodic score recomputation for {} tutors", tutors.size());
    }

    private double computeScore(User tutor, List<TutorSubject> preloadedSubjects) {
        UUID id = tutor.getId();

        double ratingScore = computeRatingScore(id);
        double reviewCountScore = computeReviewCountScore(id);
        double completionScore = computeCompletionScore(id);
        double profileScore = computeProfileScore(tutor, preloadedSubjects);
        double experienceScore = computeExperienceScore(tutor);
        double recencyScore = computeRecencyScore(id, tutor);
        double newTutorBoost = computeNewTutorBoost(tutor);
        double verifiedBonus = tutor.isIdentityVerified() ? 3 : 0;
        double referenceScore = computeReferenceScore(id);
        double favoriteScore = computeFavoriteScore(id);
        double flexibilityScore = computeFlexibilityScore(id);
        double listingScore = computeListingScore(id);

        double base = ratingScore + reviewCountScore + completionScore + profileScore
                + experienceScore + recencyScore + newTutorBoost + verifiedBonus
                + referenceScore + favoriteScore + flexibilityScore + listingScore;

        double multiplier = computeSubscriptionMultiplier(id);

        return Math.min(Math.min(base, 85.0) * multiplier, 100.0);
    }

    private double computeRatingScore(UUID tutorId) {
        var reviews = reviewRepository.findByTutorIdOrderByCreatedAtDesc(tutorId);
        if (reviews.isEmpty())
            return 0;

        double avg = reviews.stream().mapToInt(r -> r.getRating()).average().orElse(0);
        int count = reviews.size();

        double bayesian = (avg * count + BAYESIAN_GLOBAL_AVG * BAYESIAN_MIN_REVIEWS)
                / (count + BAYESIAN_MIN_REVIEWS);

        return (bayesian / 5.0) * 20;
    }

    private double computeReviewCountScore(UUID tutorId) {
        int count = reviewRepository.findByTutorIdOrderByCreatedAtDesc(tutorId).size();
        return Math.min(Math.log10(count + 1) / Math.log10(101), 1.0) * 8;
    }

    private double computeCompletionScore(UUID tutorId) {
        long resolved = lessonRepository.countResolvedByTutorId(tutorId);
        if (resolved == 0)
            return 0;

        long completed = lessonRepository.countCompletedByTutorId(tutorId);
        double rate = (double) completed / resolved;

        BigDecimal rateBD = BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP);
        userRepository.findById(tutorId).ifPresent(u -> {
            if (u.getLessonCompletionRate() == null || rateBD.compareTo(u.getLessonCompletionRate()) != 0) {
                u.setLessonCompletionRate(rateBD);
                userRepository.save(u);
            }
        });

        return rate * 12;
    }

    private double computeProfileScore(User tutor, List<TutorSubject> preloadedSubjects) {
        int score = 0;

        if (tutor.getAvatarUrl() != null && !tutor.getAvatarUrl().isBlank())
            score += 15;

        if (tutor.getBio() != null && !tutor.getBio().isBlank()) {
            int len = tutor.getBio().length();
            if (len >= 200)
                score += 20;
            else if (len >= 100)
                score += 14;
            else
                score += 8;
        }

        if (tutor.getEducation() != null && !tutor.getEducation().isBlank())
            score += 12;

        if (tutor.getHourlyRate() != null && tutor.getHourlyRate().compareTo(BigDecimal.ZERO) > 0)
            score += 8;

        List<TutorSubject> subjects = preloadedSubjects != null
                ? preloadedSubjects
                : tutorSubjectRepository.findByTutorId(tutor.getId());
        if (!subjects.isEmpty()) {
            int count = subjects.size();
            if (count >= 3)
                score += 20;
            else if (count == 2)
                score += 14;
            else
                score += 8;
        }

        if (tutor.getExperienceYears() != null && tutor.getExperienceYears() > 0)
            score += 10;

        score = Math.min(score, 100);
        if (tutor.getProfileCompletionScore() == null || tutor.getProfileCompletionScore() != score) {
            tutor.setProfileCompletionScore(score);
        }

        return (score / 100.0) * 15;
    }

    private double computeExperienceScore(User tutor) {
        if (tutor.getExperienceYears() == null || tutor.getExperienceYears() <= 0)
            return 0;
        double normalized = Math.min(tutor.getExperienceYears() / 20.0, 1.0);
        return normalized * 8;
    }

    private double computeRecencyScore(UUID tutorId, User tutor) {
        if (tutor.isOnline())
            return 8;

        LocalDateTime lastActive = tutor.getLastActiveAt();
        if (lastActive != null) {
            long daysSince = ChronoUnit.DAYS.between(lastActive.toLocalDate(), LocalDate.now());
            if (daysSince <= 1)
                return 8;
            if (daysSince <= 7)
                return 6;
            if (daysSince <= 30)
                return 4;
            if (daysSince <= 90)
                return 2;
        }

        LocalDate lastLesson = lessonRepository.findLastLessonDateByTutorId(tutorId);
        if (lastLesson == null)
            return 1;

        long monthsSince = ChronoUnit.MONTHS.between(lastLesson, LocalDate.now());
        if (monthsSince <= 1)
            return 8;
        if (monthsSince <= 3)
            return 5;
        if (monthsSince <= 6)
            return 3;
        if (monthsSince <= 12)
            return 1;
        return 0;
    }

    private double computeNewTutorBoost(User tutor) {
        long daysSinceCreation = ChronoUnit.DAYS.between(tutor.getCreatedAt(), LocalDateTime.now());
        if (daysSinceCreation > NEW_TUTOR_BOOST_DAYS)
            return 0;
        double boost = (1.0 - daysSinceCreation / NEW_TUTOR_BOOST_DAYS) * 5;
        return Math.max(boost, 0);
    }

    private double computeReferenceScore(UUID tutorId) {
        long approvedCount = tutorReferenceRepository
                .findByTutorIdAndStatusOrderByCreatedAtDesc(tutorId, VerificationStatus.APPROVED)
                .size();
        if (approvedCount == 0)
            return 0;
        if (approvedCount >= 3)
            return 5;
        if (approvedCount == 2)
            return 4;
        return 2;
    }

    private double computeFavoriteScore(UUID tutorId) {
        long count = favoriteTutorRepository.countByTutorId(tutorId);
        if (count == 0)
            return 0;
        return Math.min(Math.log10(count + 1) / Math.log10(101), 1.0) * 5;
    }

    private double computeFlexibilityScore(UUID tutorId) {
        var listings = tutorListingRepository.findByTutorId(tutorId);
        if (listings.isEmpty())
            return 0;

        boolean online = listings.stream().anyMatch(l -> l.isAllowsOnline());
        boolean tutorHome = listings.stream().anyMatch(l -> l.isAllowsTutorHome());
        boolean studentHome = listings.stream().anyMatch(l -> l.isAllowsStudentHome());

        int modes = 0;
        if (online)
            modes++;
        if (tutorHome)
            modes++;
        if (studentHome)
            modes++;

        return (modes / 3.0) * 6;
    }

    private double computeListingScore(UUID tutorId) {
        var activeListings = tutorListingRepository
                .findByTutorIdAndStatusOrderByCreatedAtDesc(tutorId, "ACTIVE");
        if (activeListings.isEmpty())
            return 0;

        boolean anyRichDescription = activeListings.stream()
                .anyMatch(l -> l.getAboutTutor() != null && l.getAboutTutor().length() >= 150);

        int languageCount = activeListings.stream()
                .filter(l -> l.getLanguages() != null)
                .mapToInt(l -> l.getLanguages().size())
                .max().orElse(0);

        double score = 2.5;
        if (anyRichDescription)
            score += 1.5;
        if (languageCount >= 2)
            score += 1;

        return Math.min(score, 5);
    }

    private double computeSubscriptionMultiplier(UUID tutorId) {
        var sub = subscriptionRepository.findByTutorIdAndIsActiveTrue(tutorId);
        if (sub.isEmpty())
            return 1.0;
        return switch (sub.get().getPlanType()) {
            case VIP -> 1.2;
            case PREMIUM -> 1.1;
            case BASIC -> 1.05;
        };
    }
}
