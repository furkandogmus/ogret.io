package com.dersplatform.controller;

import com.dersplatform.model.dto.request.CreateLessonRequest;
import com.dersplatform.model.dto.response.LessonResponse;
import com.dersplatform.model.enums.LessonStatus;
import com.dersplatform.service.LessonService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LessonControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockitoBean private LessonService lessonService;

    private final String userId = UUID.randomUUID().toString();
    private final String tutorId = UUID.randomUUID().toString();

    @Test
    void createLesson_ShouldReturn201() throws Exception {
        var request = new CreateLessonRequest();
        request.setTutorId(UUID.randomUUID());
        request.setSubjectId(UUID.randomUUID());
        request.setLessonDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(14, 0));
        request.setEndTime(LocalTime.of(15, 0));

        when(lessonService.createLesson(any(), any())).thenReturn(
                LessonResponse.builder()
                        .id(UUID.randomUUID())
                        .status(LessonStatus.PENDING)
                        .lessonDate(LocalDate.now().plusDays(1))
                        .startTime(LocalTime.of(14, 0))
                        .endTime(LocalTime.of(15, 0))
                        .durationMinutes(60)
                        .price(BigDecimal.valueOf(300))
                        .build()
        );

        mockMvc.perform(post("/api/v1/lessons")
                        .with(user(userId).roles("STUDENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.durationMinutes").value(60));
    }

    @Test
    void confirmLesson_ShouldReturn200() throws Exception {
        UUID lessonId = UUID.randomUUID();

        when(lessonService.confirmLesson(any(), any())).thenReturn(
                LessonResponse.builder()
                        .id(lessonId)
                        .status(LessonStatus.CONFIRMED)
                        .build()
        );

        mockMvc.perform(put("/api/v1/lessons/{id}/confirm", lessonId)
                        .with(user(tutorId).roles("TUTOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void cancelLesson_ShouldReturn200() throws Exception {
        UUID lessonId = UUID.randomUUID();

        when(lessonService.cancelLesson(any(), any(), any())).thenReturn(
                LessonResponse.builder()
                        .id(lessonId)
                        .status(LessonStatus.CANCELLED)
                        .build()
        );

        mockMvc.perform(put("/api/v1/lessons/{id}/cancel", lessonId)
                        .with(user(userId).roles("STUDENT"))
                        .param("reason", "Müsait değil"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}
