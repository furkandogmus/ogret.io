package com.dersplatform.model.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String bio;
    private String education;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
}
