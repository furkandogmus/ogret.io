package com.dersplatform.model.entity;

import com.dersplatform.model.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tutor_references")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TutorReference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @Column(nullable = false, length = 100)
    private String recommenderName;

    @Column(nullable = false)
    private String recommenderEmail;

    @Column(nullable = false, length = 100)
    private String recommenderTitle;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VerificationStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
