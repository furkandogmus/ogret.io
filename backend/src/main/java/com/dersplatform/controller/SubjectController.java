package com.dersplatform.controller;

import com.dersplatform.model.dto.response.SubjectResponse;
import com.dersplatform.model.dto.response.TutorSummaryResponse;
import com.dersplatform.service.SubjectService;
import com.dersplatform.service.TutorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;
    private final TutorService tutorService;

    @GetMapping
    public ResponseEntity<List<SubjectResponse>> getSubjects() {
        return ResponseEntity.ok(
                subjectService.getAllActiveSubjects()
                        .stream()
                        .map(SubjectResponse::fromEntity)
                        .toList()
        );
    }

    @GetMapping("/{id}/tutors")
    public ResponseEntity<List<TutorSummaryResponse>> getTutorsBySubject(@PathVariable UUID id) {
        return ResponseEntity.ok(tutorService.getTutorsBySubject(id));
    }
}
