package com.dersplatform.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tutor_listings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TutorListing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String lessonDescription;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String aboutTutor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(nullable = false)
    private boolean allowsTutorHome;

    @Column(nullable = false)
    private boolean allowsStudentHome;

    @Column(nullable = false)
    private boolean allowsOnline;

    private Integer maxTravelDistanceKm;

    @Column(name = "languages", columnDefinition = "text[]")
    private List<String> languages;

    @Column(nullable = false, length = 20)
    private String status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
