package com.dersplatform.model.entity;

import com.dersplatform.model.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tutor_verifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TutorVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @Column(nullable = false, length = 20)
    private String documentType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VerificationStatus status;

    @Column(columnDefinition = "TEXT")
    private String adminNote;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;
}
