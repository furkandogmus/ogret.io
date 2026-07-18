package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.UpdateTutorAvailabilityRequest;
import com.dersplatform.model.entity.TutorAvailability;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.TutorAvailabilityRepository;
import com.dersplatform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TutorAvailabilityServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TutorAvailabilityRepository tutorAvailabilityRepository;
    @Mock private ProfileCompletionService profileCompletionService;

    private TutorAvailabilityService service;
    private User tutor;

    @BeforeEach
    void setUp() {
        service = new TutorAvailabilityService(userRepository, tutorAvailabilityRepository, profileCompletionService);
        tutor = User.builder().id(UUID.randomUUID()).role(Role.TUTOR).build();
        lenient().when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
    }

    @Test
    void updateMyAvailability_sortsAndSavesMultipleRangesPerDay() {
        var afternoon = request(0, "13:00", "17:00");
        var morning = request(0, "09:00", "12:00");
        var tuesday = request(1, "10:00", "15:00");
        when(tutorAvailabilityRepository.findByTutorId(tutor.getId())).thenReturn(List.of());
        when(tutorAvailabilityRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<TutorAvailability> values = new ArrayList<>(invocation.getArgument(0));
            values.forEach(value -> value.setId(UUID.randomUUID()));
            return values;
        });

        var result = service.updateMyAvailability(tutor.getId(), List.of(afternoon, tuesday, morning));

        assertEquals(3, result.size());
        assertEquals(LocalTime.of(9, 0), result.get(0).getStartTime());
        assertEquals(LocalTime.of(13, 0), result.get(1).getStartTime());
        assertEquals(1, result.get(2).getDayOfWeek());
        verify(tutorAvailabilityRepository).saveAll(anyList());
        verify(profileCompletionService).refresh(tutor);
    }

    @Test
    void updateMyAvailability_allowsAdjacentRanges() {
        when(tutorAvailabilityRepository.findByTutorId(tutor.getId())).thenReturn(List.of());
        when(tutorAvailabilityRepository.saveAll(anyList())).thenReturn(List.of());

        service.updateMyAvailability(tutor.getId(), List.of(
                request(2, "09:00", "12:00"),
                request(2, "12:00", "14:00")));

        verify(tutorAvailabilityRepository).saveAll(anyList());
    }

    @Test
    void updateMyAvailability_rejectsEndBeforeStart() {
        ApiException error = assertThrows(ApiException.class, () ->
                service.updateMyAvailability(tutor.getId(), List.of(request(0, "18:00", "09:00"))));

        assertEquals("Bitiş saati başlangıç saatinden sonra olmalıdır", error.getMessage());
        verify(tutorAvailabilityRepository, never()).saveAll(anyList());
    }

    @Test
    void updateMyAvailability_rejectsOverlappingRanges() {
        ApiException error = assertThrows(ApiException.class, () ->
                service.updateMyAvailability(tutor.getId(), List.of(
                        request(4, "09:00", "13:00"),
                        request(4, "12:30", "16:00"))));

        assertEquals("Aynı güne ait müsaitlik saatleri birbiriyle çakışamaz", error.getMessage());
        verify(tutorAvailabilityRepository, never()).saveAll(anyList());
    }

    @Test
    void updateMyAvailability_emptyListClearsSchedule() {
        TutorAvailability old = TutorAvailability.builder().tutor(tutor).build();
        when(tutorAvailabilityRepository.findByTutorId(tutor.getId())).thenReturn(List.of(old));
        when(tutorAvailabilityRepository.saveAll(anyList())).thenReturn(List.of());

        var result = service.updateMyAvailability(tutor.getId(), List.of());

        assertEquals(List.of(), result);
        verify(tutorAvailabilityRepository).deleteAll(List.of(old));
    }

    @Test
    void updateMyAvailability_rejectsNonTutor() {
        User student = User.builder().id(UUID.randomUUID()).role(Role.STUDENT).build();
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));

        assertThrows(ApiException.class, () -> service.updateMyAvailability(student.getId(), List.of()));
        verify(tutorAvailabilityRepository, never()).saveAll(anyList());
    }

    private UpdateTutorAvailabilityRequest request(int day, String start, String end) {
        var request = new UpdateTutorAvailabilityRequest();
        request.setDayOfWeek(day);
        request.setStartTime(LocalTime.parse(start));
        request.setEndTime(LocalTime.parse(end));
        return request;
    }
}
