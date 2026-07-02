package com.dersplatform.controller;

import com.dersplatform.model.dto.request.LoginRequest;
import com.dersplatform.model.dto.request.RegisterRequest;
import com.dersplatform.model.dto.response.AuthResponse;
import com.dersplatform.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private AuthService authService;

    @Test
    void register_ShouldReturn201() throws Exception {
        var request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPhone("+905551234567");
        request.setPassword("password123");
        request.setFullName("Test User");

        var userResponse = com.dersplatform.model.dto.response.UserResponse.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .fullName("Test User")
                .build();

        when(authService.register(any())).thenReturn(
                AuthResponse.builder()
                        .accessToken("token")
                        .refreshToken("refresh")
                        .tokenType("Bearer")
                        .expiresIn(900000)
                        .user(userResponse)
                        .build()
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("test@example.com"));
    }

    @Test
    void register_ShouldReturn400_whenInvalid() throws Exception {
        var request = new RegisterRequest();
        request.setEmail("invalid");
        request.setPhone("123");
        request.setPassword("12");
        request.setFullName("");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_ShouldReturn200() throws Exception {
        var request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(authService.login(any())).thenReturn(
                AuthResponse.builder()
                        .accessToken("token")
                        .refreshToken("refresh")
                        .tokenType("Bearer")
                        .expiresIn(900000)
                        .build()
        );

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("token"));
    }
}
