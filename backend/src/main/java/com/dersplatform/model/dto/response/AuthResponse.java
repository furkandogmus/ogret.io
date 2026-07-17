package com.dersplatform.model.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data @AllArgsConstructor @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UserResponse user;

    public AuthResponse withoutTokens() {
        return AuthResponse.builder()
                .tokenType(tokenType)
                .expiresIn(expiresIn)
                .user(user)
                .build();
    }
}
