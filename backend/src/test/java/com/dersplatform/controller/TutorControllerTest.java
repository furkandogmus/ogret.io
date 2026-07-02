package com.dersplatform.controller;

import com.dersplatform.model.dto.response.TutorSummaryResponse;
import com.dersplatform.service.TutorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TutorControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private TutorService tutorService;

    @Test
    void listTutors_ShouldReturn200() throws Exception {
        var tutor = TutorSummaryResponse.builder()
                .id(UUID.randomUUID())
                .fullName("Zeynep Kaya")
                .title("Matematik Öğretmeni")
                .hourlyRate(BigDecimal.valueOf(350))
                .ratingAvg(BigDecimal.valueOf(4.9))
                .ratingCount(127)
                .isOnline(true)
                .isIdentityVerified(true)
                .subjects(List.of("Matematik", "Fizik"))
                .build();

        Page<TutorSummaryResponse> page = new PageImpl<>(List.of(tutor), PageRequest.of(0, 20), 1);

        when(tutorService.listTutors(any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/tutors")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].fullName").value("Zeynep Kaya"))
                .andExpect(jsonPath("$.content[0].hourlyRate").value(350))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getTutorDetail_ShouldReturn200() throws Exception {
        UUID tutorId = UUID.randomUUID();

        var response = com.dersplatform.model.dto.response.UserResponse.builder()
                .id(tutorId)
                .fullName("Zeynep Kaya")
                .email("zeynep@example.com")
                .build();

        when(tutorService.getTutorDetail(tutorId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/tutors/{id}", tutorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Zeynep Kaya"));
    }
}
