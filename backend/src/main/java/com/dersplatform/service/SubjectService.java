package com.dersplatform.service;

import com.dersplatform.model.entity.Subject;
import com.dersplatform.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CACHE_KEY = "cache:subjects:all";
    private static final long CACHE_TTL_SECONDS = 3600;

    @SuppressWarnings("unchecked")
    public List<Subject> getAllActiveSubjects() {
        Object cached = redisTemplate.opsForValue().get(CACHE_KEY);
        if (cached instanceof List) {
            return (List<Subject>) cached;
        }
        List<Subject> subjects = subjectRepository.findByIsActiveTrueOrderByName();
        redisTemplate.opsForValue().set(CACHE_KEY, subjects, CACHE_TTL_SECONDS, TimeUnit.SECONDS);
        return subjects;
    }

    public void evictCache() {
        redisTemplate.delete(CACHE_KEY);
    }
}
