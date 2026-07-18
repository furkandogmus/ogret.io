package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.UpdateTutorAvailabilityRequest;
import com.dersplatform.model.dto.response.TutorAvailabilityResponse;
import com.dersplatform.model.entity.TutorAvailability;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.TutorAvailabilityRepository;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TutorAvailabilityService {

    private static final int MAX_WEEKLY_RANGES = 70;

    private final UserRepository userRepository;
    private final TutorAvailabilityRepository tutorAvailabilityRepository;
    private final ProfileCompletionService profileCompletionService;

    @Transactional(readOnly = true)
    public List<TutorAvailabilityResponse> getMyAvailability(UUID tutorId) {
        requireTutor(tutorId);
        return tutorAvailabilityRepository.findByTutorId(tutorId).stream()
                .sorted(availabilityOrder())
                .map(TutorAvailabilityResponse::fromEntity)
                .toList();
    }

    @Transactional
    public List<TutorAvailabilityResponse> updateMyAvailability(
            UUID tutorId,
            List<UpdateTutorAvailabilityRequest> requests) {
        User tutor = requireTutor(tutorId);
        List<UpdateTutorAvailabilityRequest> normalized = validateAndSort(requests);

        tutorAvailabilityRepository.deleteAll(tutorAvailabilityRepository.findByTutorId(tutorId));

        List<TutorAvailability> saved = tutorAvailabilityRepository.saveAll(normalized.stream()
                .map(request -> TutorAvailability.builder()
                        .tutor(tutor)
                        .dayOfWeek(request.getDayOfWeek())
                        .startTime(request.getStartTime())
                        .endTime(request.getEndTime())
                        .isActive(true)
                        .build())
                .toList());
        tutorAvailabilityRepository.flush();
        profileCompletionService.refresh(tutor);

        return saved.stream()
                .sorted(availabilityOrder())
                .map(TutorAvailabilityResponse::fromEntity)
                .toList();
    }

    private User requireTutor(UUID tutorId) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> ApiException.notFound("Öğretmen bulunamadı"));
        if (tutor.getRole() != Role.TUTOR) {
            throw ApiException.forbidden("Müsaitlik takvimini yalnızca öğretmenler düzenleyebilir");
        }
        return tutor;
    }

    private List<UpdateTutorAvailabilityRequest> validateAndSort(
            List<UpdateTutorAvailabilityRequest> requests) {
        if (requests == null) {
            throw ApiException.badRequest("Müsaitlik listesi zorunludur");
        }
        if (requests.size() > MAX_WEEKLY_RANGES) {
            throw ApiException.badRequest("Bir haftaya en fazla 70 saat aralığı ekleyebilirsiniz");
        }

        List<UpdateTutorAvailabilityRequest> sorted = new ArrayList<>(requests);
        for (UpdateTutorAvailabilityRequest request : sorted) {
            if (request == null || request.getDayOfWeek() == null
                    || request.getStartTime() == null || request.getEndTime() == null) {
                throw ApiException.badRequest("Her müsaitlik aralığında gün, başlangıç ve bitiş saati olmalıdır");
            }
            if (request.getDayOfWeek() < 0 || request.getDayOfWeek() > 6) {
                throw ApiException.badRequest("Gün 0 ile 6 arasında olmalıdır");
            }
            if (!request.getEndTime().isAfter(request.getStartTime())) {
                throw ApiException.badRequest("Bitiş saati başlangıç saatinden sonra olmalıdır");
            }
        }

        sorted.sort(Comparator
                .comparing(UpdateTutorAvailabilityRequest::getDayOfWeek)
                .thenComparing(UpdateTutorAvailabilityRequest::getStartTime)
                .thenComparing(UpdateTutorAvailabilityRequest::getEndTime));

        UpdateTutorAvailabilityRequest previous = null;
        for (UpdateTutorAvailabilityRequest current : sorted) {
            if (previous != null
                    && previous.getDayOfWeek().equals(current.getDayOfWeek())
                    && current.getStartTime().isBefore(previous.getEndTime())) {
                throw ApiException.badRequest("Aynı güne ait müsaitlik saatleri birbiriyle çakışamaz");
            }
            previous = current;
        }
        return sorted;
    }

    private Comparator<TutorAvailability> availabilityOrder() {
        return Comparator.comparing(TutorAvailability::getDayOfWeek)
                .thenComparing(TutorAvailability::getStartTime)
                .thenComparing(TutorAvailability::getEndTime);
    }
}
