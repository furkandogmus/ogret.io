package com.dersplatform.controller;

import com.dersplatform.model.entity.BlogCategory;
import com.dersplatform.model.entity.BlogPost;
import com.dersplatform.model.entity.BlogTag;
import com.dersplatform.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    @GetMapping("/blog/posts")
    public ResponseEntity<Page<BlogPost>> getPosts(
            @RequestParam(required = false) UUID categoryId,
            Pageable pageable) {
        return ResponseEntity.ok(blogService.getPublishedPosts(categoryId, pageable));
    }

    @GetMapping("/blog/posts/{slug}")
    public ResponseEntity<BlogPost> getPost(@PathVariable String slug) {
        BlogPost post = blogService.getPostBySlug(slug);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/blog/featured")
    public ResponseEntity<Page<BlogPost>> getFeatured(Pageable pageable) {
        return ResponseEntity.ok(blogService.getFeaturedPosts(pageable));
    }

    @GetMapping("/blog/categories")
    public ResponseEntity<List<BlogCategory>> getCategories() {
        return ResponseEntity.ok(blogService.getAllCategories());
    }

    @GetMapping("/blog/tags")
    public ResponseEntity<List<BlogTag>> getTags() {
        return ResponseEntity.ok(blogService.getAllTags());
    }

    @PostMapping("/blog/posts/{id}/view")
    public ResponseEntity<Void> recordView(@PathVariable UUID id) {
        blogService.incrementViewCount(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/blog/posts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BlogPost>> getAllPosts(Pageable pageable) {
        return ResponseEntity.ok(blogService.getAllPosts(pageable));
    }

    @PostMapping("/admin/blog/posts")
    @PreAuthorize("hasRole('ADMIN')")
    @SuppressWarnings("unchecked")
    public ResponseEntity<BlogPost> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        UUID authorId = UUID.fromString(userDetails.getUsername());
        BlogPost post = blogService.createPost(
                (String) body.get("title"),
                (String) body.get("content"),
                (String) body.get("excerpt"),
                authorId,
                body.get("categoryId") != null ? UUID.fromString((String) body.get("categoryId")) : null,
                body.get("tagIds") != null ? new HashSet<>((List<UUID>) body.get("tagIds")) : null,
                (String) body.get("metaTitle"),
                (String) body.get("metaDescription"),
                body.get("scheduledAt") != null ? LocalDateTime.parse((String) body.get("scheduledAt")) : null,
                body.get("isFeatured") != null && (Boolean) body.get("isFeatured"));
        return ResponseEntity.ok(post);
    }

    @PutMapping("/admin/blog/posts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SuppressWarnings("unchecked")
    public ResponseEntity<BlogPost> updatePost(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        BlogPost post = blogService.updatePost(
                id,
                (String) body.get("title"),
                (String) body.get("content"),
                (String) body.get("excerpt"),
                body.get("categoryId") != null ? UUID.fromString((String) body.get("categoryId")) : null,
                body.get("tagIds") != null ? new HashSet<>((List<UUID>) body.get("tagIds")) : null,
                (String) body.get("metaTitle"),
                (String) body.get("metaDescription"),
                body.get("scheduledAt") != null ? LocalDateTime.parse((String) body.get("scheduledAt")) : null,
                body.get("isFeatured") != null && (Boolean) body.get("isFeatured"));
        return ResponseEntity.ok(post);
    }

    @PutMapping("/admin/blog/posts/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogPost> publishPost(@PathVariable UUID id) {
        return ResponseEntity.ok(blogService.publishPost(id));
    }

    @PutMapping("/admin/blog/posts/{id}/draft")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogPost> unpublishPost(@PathVariable UUID id) {
        return ResponseEntity.ok(blogService.unpublishPost(id));
    }

    @DeleteMapping("/admin/blog/posts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePost(@PathVariable UUID id) {
        blogService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/blog/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogCategory> createCategory(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(blogService.createCategory(
                body.get("name"), body.get("slug"), body.get("description")));
    }

    @PostMapping("/admin/blog/tags")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogTag> createTag(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(blogService.createTag(body.get("name"), body.get("slug")));
    }
}
