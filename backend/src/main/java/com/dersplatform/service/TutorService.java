package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.response.TutorSummaryResponse;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.model.entity.TutorAvailability;
import com.dersplatform.model.entity.TutorSubject;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.SubscriptionRepository;
import com.dersplatform.repository.TutorAvailabilityRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.TutorSubjectRepository;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TutorService {

    private final UserRepository userRepository;
    private final TutorSubjectRepository tutorSubjectRepository;
    private final TutorAvailabilityRepository tutorAvailabilityRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final TutorListingRepository tutorListingRepository;

    public Page<TutorSummaryResponse> listTutors(UUID subjectId, BigDecimal minPrice, BigDecimal maxPrice,
                                                  BigDecimal minRating, Pageable pageable) {
        List<UUID> activeListingTutorIds = tutorListingRepository.findDistinctTutorIdsWithActiveListings();
        if (activeListingTutorIds.isEmpty()) {
            return Page.empty();
        }

        Page<User> tutors;

        if (subjectId != null) {
            List<UUID> subjectTutorIds = tutorSubjectRepository.findBySubjectId(subjectId)
                    .stream().map(ts -> ts.getTutor().getId()).distinct().toList();
            List<UUID> filteredIds = subjectTutorIds.stream()
                    .filter(activeListingTutorIds::contains)
                    .toList();
            tutors = userRepository.findByIdIn(filteredIds, pageable);
        } else {
            tutors = userRepository.findByRoleAndIdIn(Role.TUTOR, activeListingTutorIds, pageable);
        }

        Map<UUID, String> premiumPlans = subscriptionRepository.findAllActiveWithTutor().stream()
                .collect(Collectors.toMap(s -> s.getTutor().getId(), s -> s.getPlanType().name()));

        List<UUID> tutorIds = tutors.getContent().stream().map(User::getId).toList();
        Map<UUID, List<String>> subjectsByTutor = tutorSubjectRepository.findByTutorIdIn(tutorIds)
                .stream()
                .collect(Collectors.groupingBy(
                        ts -> ts.getTutor().getId(),
                        Collectors.mapping(ts -> ts.getSubject().getName(), Collectors.toList())
                ));

        return tutors.map(tutor -> {
            List<String> subjects = subjectsByTutor.getOrDefault(tutor.getId(), List.of())
                    .stream().distinct().toList();
            String plan = premiumPlans.getOrDefault(tutor.getId(), null);
            return TutorSummaryResponse.fromEntity(tutor, subjects, plan);
        });
    }

    public List<TutorSummaryResponse> getTutorsBySubject(UUID subjectId) {
        List<UUID> activeListingTutorIds = tutorListingRepository.findDistinctTutorIdsWithActiveListings();
        if (activeListingTutorIds.isEmpty()) {
            return List.of();
        }

        Set<UUID> activeSet = Set.copyOf(activeListingTutorIds);

        Map<UUID, String> premiumPlans = subscriptionRepository.findAllActiveWithTutor().stream()
                .collect(Collectors.toMap(s -> s.getTutor().getId(), s -> s.getPlanType().name()));

        List<User> tutors = tutorSubjectRepository.findBySubjectId(subjectId)
                .stream()
                .map(ts -> ts.getTutor())
                .filter(tutor -> activeSet.contains(tutor.getId()))
                .distinct()
                .toList();

        List<UUID> tutorIds = tutors.stream().map(User::getId).toList();
        Map<UUID, List<String>> subjectsByTutor = tutorSubjectRepository.findByTutorIdIn(tutorIds)
                .stream()
                .collect(Collectors.groupingBy(
                        ts -> ts.getTutor().getId(),
                        Collectors.mapping(ts -> ts.getSubject().getName(), Collectors.toList())
                ));

        return tutors.stream()
                .map(tutor -> {
                    List<String> subjects = subjectsByTutor.getOrDefault(tutor.getId(), List.of());
                    String plan = premiumPlans.getOrDefault(tutor.getId(), null);
                    return TutorSummaryResponse.fromEntity(tutor, subjects, plan);
                })
                .toList();
    }

    public List<Map<String, Object>> getAvailability(UUID tutorId) {
        return tutorAvailabilityRepository.findByTutorIdAndIsActiveTrue(tutorId)
                .stream()
                .map(a -> Map.<String, Object>of(
                        "dayOfWeek", a.getDayOfWeek(),
                        "startTime", a.getStartTime().toString(),
                        "endTime", a.getEndTime().toString()
                ))
                .toList();
    }

    public UserResponse getTutorDetail(UUID tutorId) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> ApiException.notFound("Öğretmen bulunamadı"));

        if (tutor.getRole() != Role.TUTOR) {
            throw ApiException.badRequest("Bu kullanıcı bir öğretmen değil");
        }

        return UserResponse.fromEntity(tutor);
    }

    public void computePopularityScore(UUID tutorId) {
        userRepository.findById(tutorId).ifPresent(tutor -> {
            if (tutor.getRole() != Role.TUTOR) return;

            double ratingScore = tutor.getRatingAvg() != null
                    ? (tutor.getRatingAvg().doubleValue() / 5.0) * 30 : 0;
            double countScore = tutor.getRatingCount() != null
                    ? Math.min(tutor.getRatingCount() / 50.0, 1.0) * 20 : 0;
            double verifiedScore = tutor.isIdentityVerified() ? 15 : 0;
            double bioScore = (tutor.getBio() != null && !tutor.getBio().isBlank()) ? 10 : 0;
            double eduScore = (tutor.getEducation() != null && !tutor.getEducation().isBlank()) ? 5 : 0;
            double expScore = tutor.getExperienceYears() != null
                    ? Math.min(tutor.getExperienceYears() / 20.0, 1.0) * 10 : 0;
            double onlineScore = tutor.isOnline() ? 10 : 0;

            double base = ratingScore + countScore + verifiedScore + bioScore + eduScore + expScore + onlineScore;

            double multiplier = 1.0;
            var sub = subscriptionRepository.findByTutorIdAndIsActiveTrue(tutorId);
            if (sub.isPresent()) {
                multiplier = switch (sub.get().getPlanType()) {
                    case VIP -> 2.0;
                    case PREMIUM -> 1.5;
                    case BASIC -> 1.2;
                };
            }

            double score = base * multiplier;
            tutor.setPopularityScore(BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP));
            userRepository.save(tutor);
        });
    }
}
