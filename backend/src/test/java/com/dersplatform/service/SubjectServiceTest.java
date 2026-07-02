package com.dersplatform.service;

import com.dersplatform.model.entity.Subject;
import com.dersplatform.repository.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubjectServiceTest {

    @Mock private SubjectRepository subjectRepository;
    @Mock private RedisTemplate<String, Object> redisTemplate;
    @Mock private ValueOperations<String, Object> valueOperations;

    private SubjectService subjectService;
    private List<Subject> subjects;

    @BeforeEach
    void setUp() {
        subjectService = new SubjectService(subjectRepository, redisTemplate);

        subjects = List.of(
                Subject.builder().id(UUID.randomUUID()).name("Matematik").isActive(true).build(),
                Subject.builder().id(UUID.randomUUID()).name("Fizik").isActive(true).build()
        );
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void getAllActiveSubjects_ShouldReturnFromCache_whenCached() {
        when(valueOperations.get("cache:subjects:all")).thenReturn((Object) subjects);

        List<Subject> result = subjectService.getAllActiveSubjects();

        assertEquals(2, result.size());
        verify(subjectRepository, never()).findByIsActiveTrueOrderByName();
    }

    @Test
    void getAllActiveSubjects_ShouldFetchFromDb_whenNotCached() {
        when(valueOperations.get("cache:subjects:all")).thenReturn(null);
        when(subjectRepository.findByIsActiveTrueOrderByName()).thenReturn(subjects);

        List<Subject> result = subjectService.getAllActiveSubjects();

        assertEquals(2, result.size());
        verify(valueOperations).set(eq("cache:subjects:all"), eq(subjects), eq(3600L), eq(TimeUnit.SECONDS));
    }

    @Test
    void evictCache_ShouldDeleteKey() {
        subjectService.evictCache();
        verify(redisTemplate).delete("cache:subjects:all");
    }
}
