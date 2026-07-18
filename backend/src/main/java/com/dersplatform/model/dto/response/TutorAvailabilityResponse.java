package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.TutorAvailability;
import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class TutorAvailabilityResponse {
    private UUID id;
    private Integer dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean isActive;

    public static TutorAvailabilityResponse fromEntity(TutorAvailability availability) {
        return TutorAvailabilityResponse.builder()
                .id(availability.getId())
                .dayOfWeek(availability.getDayOfWeek())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .isActive(availability.isActive())
                .build();
    }
}
