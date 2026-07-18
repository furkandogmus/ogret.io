package com.dersplatform.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTemporaryPasswordRequest {
    @NotBlank(message = "Geçici şifre zorunludur")
    @Size(min = 6, max = 100, message = "Geçici şifre 6-100 karakter olmalıdır")
    private String temporaryPassword;
}
