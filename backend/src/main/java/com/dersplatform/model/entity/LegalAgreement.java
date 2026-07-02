package com.dersplatform.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "legal_agreements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LegalAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    private int version;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private boolean isRequired;

    private boolean isActive;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
