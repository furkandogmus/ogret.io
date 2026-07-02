package com.dersplatform.model.dto.request;

import com.dersplatform.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Email @Size(max = 255)
    private String email;

    @NotBlank @Pattern(regexp = "^\\+?[0-9]{10,15}$")
    private String phone;

    @NotBlank @Size(min = 6, max = 100)
    private String password;

    @NotBlank @Size(max = 100)
    private String fullName;

    private Role role;
}
