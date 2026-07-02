package com.dersplatform.repository;

import com.dersplatform.model.entity.BlogTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BlogTagRepository extends JpaRepository<BlogTag, UUID> {
    Optional<BlogTag> findBySlug(String slug);
}
