package com.dersplatform.service;

import com.dersplatform.model.dto.response.SubjectResponse;
import com.dersplatform.model.entity.Subject;
import com.dersplatform.model.enums.SubjectCategory;
import com.dersplatform.repository.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubjectServiceTest {

    @Mock private SubjectRepository subjectRepository;

    private SubjectService subjectService;
    private List<Subject> subjects;

    @BeforeEach
    void setUp() {
        subjectService = new SubjectService(subjectRepository);

        subjects = List.of(
                Subject.builder().id(UUID.randomUUID()).name("Matematik").category(SubjectCategory.YKS).isActive(true).build(),
                Subject.builder().id(UUID.randomUUID()).name("Fizik").category(SubjectCategory.LGS).isActive(true).build()
        );
    }

    @Test
    void getAllActiveSubjects_ShouldFetchFromDbAndMapToDto() {
        when(subjectRepository.findByIsActiveTrueOrderByName()).thenReturn(subjects);

        List<SubjectResponse> result = subjectService.getAllActiveSubjects();

        assertEquals(2, result.size());
        assertEquals("Matematik", result.get(0).getName());
        assertEquals("Fizik", result.get(1).getName());
        verify(subjectRepository, times(1)).findByIsActiveTrueOrderByName();
    }
}
