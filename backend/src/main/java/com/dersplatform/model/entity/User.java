package com.dersplatform.model.entity;

import com.dersplatform.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@SQLRestriction("deleted_at IS NULL")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    private boolean isVerified;

    @Builder.Default
    @Column(nullable = false)
    private Integer tokenVersion = 0;

    private boolean isProfileComplete;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String education;

    private Integer experienceYears;

    @Column(precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(precision = 2, scale = 1)
    private BigDecimal ratingAvg;

    private Integer ratingCount;

    private boolean isOnline;

    private boolean isIdentityVerified;

    @Column(precision = 5, scale = 2)
    private BigDecimal popularityScore;

    @Column(precision = 5, scale = 1)
    private BigDecimal responseTimeHours;

    private LocalDateTime lastActiveAt;

    @Column(precision = 3, scale = 2)
    private BigDecimal lessonCompletionRate;

    private Integer profileCompletionScore;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;
}
