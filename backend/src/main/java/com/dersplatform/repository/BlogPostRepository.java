package com.dersplatform.repository;

import com.dersplatform.model.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface BlogPostRepository extends JpaRepository<BlogPost, UUID> {

    Optional<BlogPost> findBySlug(String slug);

    Page<BlogPost> findByStatusOrderByPublishedAtDesc(String status, Pageable pageable);

    Page<BlogPost> findByStatusAndCategoryIdOrderByPublishedAtDesc(String status, UUID categoryId, Pageable pageable);

    @Query("SELECT p FROM BlogPost p WHERE p.status = 'PUBLISHED' AND p.isFeatured = true ORDER BY p.publishedAt DESC")
    Page<BlogPost> findFeatured(Pageable pageable);

    long countByStatus(String status);
}
