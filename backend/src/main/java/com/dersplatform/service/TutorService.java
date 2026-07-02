package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.response.TutorSummaryResponse;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.model.entity.TutorAvailability;
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
import java.time.LocalTime;
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
    private final ScoringService scoringService;

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
        scoringService.recompute(tutorId);
    }
}
