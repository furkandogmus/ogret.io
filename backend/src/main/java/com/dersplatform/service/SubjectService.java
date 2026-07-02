package com.dersplatform.service;

import com.dersplatform.model.dto.response.SubjectResponse;
import com.dersplatform.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    @Cacheable(value = "subjects", unless = "#result.isEmpty()")
    public List<SubjectResponse> getAllActiveSubjects() {
        return subjectRepository.findByIsActiveTrueOrderByName()
                .stream()
                .map(SubjectResponse::fromEntity)
                .toList();
    }

    @CacheEvict(value = "subjects", allEntries = true)
    public void evictCache() {
    }
}
