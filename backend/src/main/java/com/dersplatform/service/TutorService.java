package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.response.TutorSummaryResponse;
import com.dersplatform.model.dto.response.PublicUserResponse;
import com.dersplatform.model.entity.Lesson;
import com.dersplatform.model.entity.TutorAvailability;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.TutorAvailabilityRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.TutorSubjectRepository;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
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
    private final LessonRepository lessonRepository;
    private final TutorListingRepository tutorListingRepository;
    private final ScoringService scoringService;

    public Page<TutorSummaryResponse> listTutors(UUID subjectId, BigDecimal minPrice, BigDecimal maxPrice,
                                                  BigDecimal minRating, Pageable pageable) {
        List<UUID> activeListingTutorIds = tutorListingRepository.findDistinctTutorIdsWithActiveListings();
        if (activeListingTutorIds.isEmpty()) {
            return new org.springframework.data.domain.PageImpl<>(List.of(), pageable, 0);
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
            return TutorSummaryResponse.fromEntity(tutor, subjects, null);
        });
    }

    public List<TutorSummaryResponse> getTutorsBySubject(UUID subjectId) {
        List<UUID> activeListingTutorIds = tutorListingRepository.findDistinctTutorIdsWithActiveListings();
        if (activeListingTutorIds.isEmpty()) {
            return List.of();
        }

        Set<UUID> activeSet = Set.copyOf(activeListingTutorIds);

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
                    return TutorSummaryResponse.fromEntity(tutor, subjects, null);
                })
                .toList();
    }

    public List<Map<String, Object>> getAvailability(UUID tutorId, LocalDate date) {
        List<TutorAvailability> slots = tutorAvailabilityRepository.findByTutorIdAndIsActiveTrue(tutorId);

        if (date == null) {
            return slots.stream()
                    .map(a -> Map.<String, Object>of(
                            "dayOfWeek", a.getDayOfWeek(),
                            "startTime", a.getStartTime().toString(),
                            "endTime", a.getEndTime().toString()
                    ))
                    .toList();
        }

        int dayOfWeek = date.getDayOfWeek().getValue() - 1;
        List<Lesson> bookedLessons = lessonRepository.findByTutorIdAndDateNotCancelled(tutorId, date);
        List<Map<String, Object>> result = new ArrayList<>();

        for (TutorAvailability slot : slots) {
            if (slot.getDayOfWeek() != dayOfWeek) continue;
            LocalTime slotStart = slot.getStartTime();
            LocalTime slotEnd = slot.getEndTime();

            // Collect booked time ranges for this day
            List<LocalTime[]> bookedRanges = new ArrayList<>();
            for (Lesson lesson : bookedLessons) {
                LocalTime ls = lesson.getStartTime();
                LocalTime le = lesson.getEndTime();
                // Only include overlaps with this slot
                if (ls.isBefore(slotEnd) && le.isAfter(slotStart)) {
                    bookedRanges.add(new LocalTime[]{
                        ls.isAfter(slotStart) ? ls : slotStart,
                        le.isBefore(slotEnd) ? le : slotEnd
                    });
                }
            }

            bookedRanges.sort((a, b) -> a[0].compareTo(b[0]));

            // Subtract booked ranges from the slot
            LocalTime cursor = slotStart;
            for (LocalTime[] booked : bookedRanges) {
                if (booked[0].isAfter(cursor)) {
                    result.add(Map.of(
                        "dayOfWeek", dayOfWeek,
                        "startTime", cursor.toString(),
                        "endTime", booked[0].toString()
                    ));
                }
                if (booked[1].isAfter(cursor)) {
                    cursor = booked[1];
                }
            }
            if (cursor.isBefore(slotEnd)) {
                result.add(Map.of(
                    "dayOfWeek", dayOfWeek,
                    "startTime", cursor.toString(),
                    "endTime", slotEnd.toString()
                ));
            }
        }
        return result;
    }

    public PublicUserResponse getTutorDetail(UUID tutorId) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> ApiException.notFound("Öğretmen bulunamadı"));

        if (tutor.getRole() != Role.TUTOR) {
            throw ApiException.badRequest("Bu kullanıcı bir öğretmen değil");
        }

        return PublicUserResponse.fromEntity(tutor);
    }

    public void computePopularityScore(UUID tutorId) {
        scoringService.recompute(tutorId);
    }
}
