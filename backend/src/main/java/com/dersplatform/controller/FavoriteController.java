package com.dersplatform.controller;

import com.dersplatform.model.dto.response.UserResponse;
import com.dersplatform.model.entity.FavoriteTutor;
import com.dersplatform.model.entity.User;
import com.dersplatform.repository.FavoriteTutorRepository;
import com.dersplatform.repository.UserRepository;
import com.dersplatform.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteTutorRepository favoriteRepository;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<UserResponse>> getFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        UUID studentId = UUID.fromString(userDetails.getUsername());
        List<UserResponse> tutors = favoriteRepository.findByStudentId(studentId)
                .stream()
                .map(fav -> UserResponse.fromEntity(fav.getTutor()))
                .toList();
        return ResponseEntity.ok(tutors);
    }

    @PostMapping("/{tutorId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> addFavorite(
            @PathVariable UUID tutorId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID studentId = UUID.fromString(userDetails.getUsername());
        if (!favoriteRepository.existsByStudentIdAndTutorId(studentId, tutorId)) {
            User student = userRepository.findById(studentId).orElseThrow();
            User tutor = userRepository.findById(tutorId).orElseThrow(() -> ApiException.notFound("Öğretmen bulunamadı"));
            favoriteRepository.save(FavoriteTutor.builder().student(student).tutor(tutor).build());
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{tutorId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable UUID tutorId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID studentId = UUID.fromString(userDetails.getUsername());
        favoriteRepository.deleteById(new FavoriteTutor.FavoriteTutorId(studentId, tutorId));
        return ResponseEntity.ok().build();
    }
}
