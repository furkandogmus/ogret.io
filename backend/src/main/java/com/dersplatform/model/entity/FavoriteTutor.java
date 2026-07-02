package com.dersplatform.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "favorite_tutors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@IdClass(FavoriteTutor.FavoriteTutorId.class)
public class FavoriteTutor {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class FavoriteTutorId implements Serializable {
        private UUID student;
        private UUID tutor;
    }
}
