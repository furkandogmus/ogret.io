package com.dersplatform.model.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class UpdateTutorAvailabilityRequest {

    @NotNull(message = "Gün seçimi zorunludur")
    @Min(value = 0, message = "Gün 0 ile 6 arasında olmalıdır")
    @Max(value = 6, message = "Gün 0 ile 6 arasında olmalıdır")
    private Integer dayOfWeek;

    @NotNull(message = "Başlangıç saati zorunludur")
    private LocalTime startTime;

    @NotNull(message = "Bitiş saati zorunludur")
    private LocalTime endTime;
}
