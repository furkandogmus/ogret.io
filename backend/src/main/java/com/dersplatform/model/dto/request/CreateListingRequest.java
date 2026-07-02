package com.dersplatform.model.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreateListingRequest {
    @NotNull(message = "Ders konusu seçilmelidir")
    private UUID subjectId;

    @NotBlank(message = "İlan başlığı boş bırakılamaz")
    @Size(max = 150, message = "Başlık en fazla 150 karakter olabilir")
    private String title;

    @NotBlank(message = "Ders açıklaması boş bırakılamaz")
    private String lessonDescription;

    @NotBlank(message = "Hakkınızda alanı boş bırakılamaz")
    private String aboutTutor;

    @NotNull(message = "Saatlik ücret belirtilmelidir")
    @DecimalMin(value = "0.0", inclusive = false, message = "Ücret sıfırdan büyük olmalıdır")
    private BigDecimal hourlyRate;

    private boolean allowsTutorHome;
    private boolean allowsStudentHome;
    private boolean allowsOnline;

    private Integer maxTravelDistanceKm;

    private List<String> languages;
}
