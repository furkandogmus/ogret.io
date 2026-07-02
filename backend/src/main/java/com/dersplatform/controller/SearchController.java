package com.dersplatform.controller;

import com.dersplatform.service.TutorListingService;
import com.dersplatform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final TutorListingService tutorListingService;
    private final UserService userService;

    @GetMapping("/suggestions")
    public ResponseEntity<Map<String, Object>> getSuggestions(@RequestParam String q) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(Map.of(
                "subjects", List.of(),
                "listings", List.of(),
                "tutors", List.of()
            ));
        }
        var listings = tutorListingService.searchByTrigramSimilarity(q.trim());
        var subjects = tutorListingService.searchSubjectsByName(q.trim());
        var tutors = userService.searchUsersSimple(q.trim());

        return ResponseEntity.ok(Map.of(
            "subjects", subjects,
            "listings", listings.size() > 5 ? listings.subList(0, 5) : listings,
            "tutors", tutors.size() > 3 ? tutors.subList(0, 3) : tutors
        ));
    }
}
