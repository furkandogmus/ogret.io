package com.dersplatform.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateEmailVerificationRequest {
    @NotNull(message = "Doğrulama durumu zorunludur")
    private Boolean verified;
}
