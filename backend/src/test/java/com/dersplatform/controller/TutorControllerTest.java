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
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

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

    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private TutorService tutorService;
    @MockitoBean
    private StringRedisTemplate stringRedisTemplate;
    @MockitoBean
    private RedisTemplate<String, Object> redisTemplate;
    @MockitoBean
    private S3Client s3Client;
    @MockitoBean
    private S3Presigner s3Presigner;
    @MockitoBean
    private RedisConnectionFactory redisConnectionFactory;

    @org.junit.jupiter.api.BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        var valueOps = org.mockito.Mockito.mock(org.springframework.data.redis.core.ValueOperations.class);
        org.mockito.Mockito.when(stringRedisTemplate.opsForValue()).thenReturn(valueOps);
        org.mockito.Mockito.when(valueOps.increment(org.mockito.Mockito.any())).thenReturn(1L);
    }

    @Test
    void listTutors_ShouldReturn200() throws Exception {
        var tutor = TutorSummaryResponse.builder()
                .id(UUID.randomUUID())
                .fullName("Rabia Çetingül")
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
                .andExpect(jsonPath("$.content[0].fullName").value("Rabia Çetingül"))
                .andExpect(jsonPath("$.content[0].hourlyRate").value(350))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getTutorDetail_ShouldReturn200() throws Exception {
        UUID tutorId = UUID.randomUUID();

        var response = com.dersplatform.model.dto.response.PublicUserResponse.builder()
                .id(tutorId)
                .fullName("Rabia Çetingül")
                .build();

        when(tutorService.getTutorDetail(tutorId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/tutors/{id}", tutorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Rabia Çetingül"));
    }
}
