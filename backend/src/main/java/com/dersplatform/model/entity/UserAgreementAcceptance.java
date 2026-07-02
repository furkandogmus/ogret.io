package com.dersplatform.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_agreement_acceptances",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "agreement_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserAgreementAcceptance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agreement_id", nullable = false)
    private LegalAgreement agreement;

    @CreationTimestamp
    private LocalDateTime acceptedAt;

    @Column(length = 45)
    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String userAgent;
}
