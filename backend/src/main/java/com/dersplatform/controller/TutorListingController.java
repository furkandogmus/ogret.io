package com.dersplatform.controller;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.CreateListingRequest;
import com.dersplatform.model.dto.response.ListingResponse;
import com.dersplatform.service.TutorListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TutorListingController {

    private final TutorListingService tutorListingService;

    @PostMapping("/tutors/me/listings")
    public ResponseEntity<ListingResponse> createListing(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateListingRequest request) {
        if (userDetails == null) {
            throw ApiException.unauthorized("Kimlik doğrulaması gerekli");
        }
        UUID tutorId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tutorListingService.createListing(tutorId, request));
    }

    @GetMapping("/tutors/me/listings")
    public ResponseEntity<List<ListingResponse>> getMyListings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String status) {
        if (userDetails == null) {
            throw ApiException.unauthorized("Kimlik doğrulaması gerekli");
        }
        UUID tutorId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(tutorListingService.getTutorListings(tutorId, status));
    }

    @PutMapping("/tutors/me/listings/{id}")
    public ResponseEntity<ListingResponse> updateListing(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody CreateListingRequest request) {
        if (userDetails == null) {
            throw ApiException.unauthorized("Kimlik doğrulaması gerekli");
        }
        UUID tutorId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(tutorListingService.updateListing(tutorId, id, request));
    }

    @DeleteMapping("/tutors/me/listings/{id}")
    public ResponseEntity<Void> deleteListing(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        if (userDetails == null) {
            throw ApiException.unauthorized("Kimlik doğrulaması gerekli");
        }
        UUID tutorId = UUID.fromString(userDetails.getUsername());
        tutorListingService.deleteListing(tutorId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tutors/{tutorId}/listings")
    public ResponseEntity<List<ListingResponse>> getTutorListings(
            @PathVariable UUID tutorId) {
        return ResponseEntity.ok(tutorListingService.getTutorListings(tutorId, "ACTIVE"));
    }

    @GetMapping("/tutors/listings/{id}")
    public ResponseEntity<ListingResponse> getListingDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(tutorListingService.getListingDetails(id));
    }

    @GetMapping("/tutors/listings")
    public ResponseEntity<List<ListingResponse>> searchListings(
            @RequestParam(required = false) UUID subjectId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) Boolean online,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(tutorListingService.searchListings(subjectId, minPrice, maxPrice, minRating, online, sort));
    }
}
