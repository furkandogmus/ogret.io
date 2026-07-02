package com.dersplatform.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "blog_posts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String excerpt;

    @Column(columnDefinition = "TEXT")
    private String coverImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private BlogCategory category;

    @Column(nullable = false, length = 20)
    private String status;

    private LocalDateTime publishedAt;

    private LocalDateTime scheduledAt;

    @Column(length = 255)
    private String metaTitle;

    @Column(length = 500)
    private String metaDescription;

    private int viewCount;

    private Integer readingTime;

    private boolean isFeatured;

    @ManyToMany
    @JoinTable(
        name = "blog_post_tags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<BlogTag> tags = new HashSet<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void calculateReadingTime() {
        if (content != null && !content.isBlank()) {
            int wordCount = content.trim().split("\\s+").length;
            this.readingTime = Math.max(1, wordCount / 200);
        }
    }
}
