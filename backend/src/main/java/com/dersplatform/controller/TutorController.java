package com.dersplatform.controller;

import com.dersplatform.model.dto.response.TutorSummaryResponse;
import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.service.TutorService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tutors")
@RequiredArgsConstructor
public class TutorController {

    private final TutorService tutorService;

    @GetMapping
    public ResponseEntity<Page<TutorSummaryResponse>> listTutors(
            @RequestParam(required = false) UUID subjectId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(defaultValue = "popular") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Sort sortObj = switch (sort) {
            case "rating" -> Sort.by(Sort.Direction.DESC, "ratingAvg");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "hourlyRate");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "hourlyRate");
            case "score" -> Sort.by(Sort.Direction.DESC, "popularityScore");
            default -> Sort.by(Sort.Direction.DESC, "popularityScore");
        };
        return ResponseEntity.ok(tutorService.listTutors(subjectId, minPrice, maxPrice, minRating, PageRequest.of(page, size, sortObj)));
    }

    @GetMapping("/{id}")
    @Cacheable(value = "tutorDetail", key = "#id", unless = "#result.body == null")
    public ResponseEntity<UserResponse> getTutorDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(tutorService.getTutorDetail(id));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<Map<String, Object>>> getAvailability(@PathVariable UUID id) {
        return ResponseEntity.ok(tutorService.getAvailability(id));
    }
}
