package com.dersplatform.controller;

import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.service.FileStorageService;
import com.dersplatform.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AvatarControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private FileStorageService fileStorageService;
    @MockitoBean private UserService userService;
    @MockitoBean private StringRedisTemplate stringRedisTemplate;
    @MockitoBean private RedisTemplate<String, Object> redisTemplate;
    @MockitoBean private RedisConnectionFactory redisConnectionFactory;
    @MockitoBean private S3Client s3Client;
    @MockitoBean private S3Presigner s3Presigner;

    private final UUID userId = UUID.randomUUID();
    private final String avatarUrl = "/storage/dersplatform-public/avatars/11111111-1111-1111-1111-111111111111.png";

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        var valueOps = org.mockito.Mockito.mock(org.springframework.data.redis.core.ValueOperations.class);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.increment(any())).thenReturn(1L);
    }

    @Test
    void genericUploadReturnsBrowserRenderableSameOriginUrl() throws Exception {
        when(fileStorageService.uploadFile(any(), any())).thenReturn(avatarUrl);

        mockMvc.perform(multipart("/api/v1/files/upload")
                        .file(png())
                        .param("purpose", "AVATAR")
                        .with(user(userId.toString()).roles("TUTOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value(avatarUrl));
    }

    @Test
    void atomicAvatarUploadReturnsUpdatedUserWithSameOriginUrl() throws Exception {
        when(userService.uploadAvatar(eq(userId), any())).thenReturn(
                UserResponse.builder().id(userId).avatarUrl(avatarUrl).build());

        mockMvc.perform(multipart("/api/v1/users/me/avatar")
                        .file(png())
                        .with(user(userId.toString()).roles("TUTOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value(avatarUrl));
    }

    @Test
    void avatarCanBeRemoved() throws Exception {
        when(userService.removeAvatar(userId)).thenReturn(
                UserResponse.builder().id(userId).avatarUrl(null).build());

        mockMvc.perform(delete("/api/v1/users/me/avatar")
                        .with(user(userId.toString()).roles("TUTOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").doesNotExist());
    }

    private MockMultipartFile png() {
        return new MockMultipartFile("file", "avatar.png", "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47});
    }
}
