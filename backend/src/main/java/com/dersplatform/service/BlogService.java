package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.entity.BlogCategory;
import com.dersplatform.model.entity.BlogPost;
import com.dersplatform.model.entity.BlogTag;
import com.dersplatform.model.entity.User;
import com.dersplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogPostRepository blogPostRepository;
    private final BlogCategoryRepository blogCategoryRepository;
    private final BlogTagRepository blogTagRepository;
    private final UserRepository userRepository;

    public Page<BlogPost> getPublishedPosts(UUID categoryId, Pageable pageable) {
        if (categoryId != null) {
            return blogPostRepository.findByStatusAndCategoryIdOrderByPublishedAtDesc("PUBLISHED", categoryId, pageable);
        }
        return blogPostRepository.findByStatusOrderByPublishedAtDesc("PUBLISHED", pageable);
    }

    public Page<BlogPost> getFeaturedPosts(Pageable pageable) {
        return blogPostRepository.findFeatured(pageable);
    }

    public BlogPost getPostBySlug(String slug) {
        BlogPost post = blogPostRepository.findBySlug(slug)
                .orElseThrow(() -> ApiException.notFound("Blog yazısı bulunamadı"));
        if ("PUBLISHED".equals(post.getStatus())) {
            blogPostRepository.save(post);
        }
        return post;
    }

    @Transactional
    public void incrementViewCount(UUID postId) {
        blogPostRepository.findById(postId).ifPresent(post -> {
            post.setViewCount(post.getViewCount() + 1);
            blogPostRepository.save(post);
        });
    }

    public List<BlogCategory> getAllCategories() {
        return blogCategoryRepository.findAll();
    }

    public List<BlogTag> getAllTags() {
        return blogTagRepository.findAll();
    }

    @Transactional
    public BlogPost createPost(String title, String content, String excerpt, UUID authorId,
                               UUID categoryId, Set<UUID> tagIds, String metaTitle, String metaDescription,
                               LocalDateTime scheduledAt, boolean isFeatured) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        String slug = generateSlug(title);

        BlogPost.BlogPostBuilder builder = BlogPost.builder()
                .title(title)
                .slug(slug)
                .content(content)
                .excerpt(excerpt)
                .author(author)
                .metaTitle(metaTitle)
                .metaDescription(metaDescription)
                .isFeatured(isFeatured)
                .status("DRAFT");

        if (categoryId != null) {
            BlogCategory category = blogCategoryRepository.findById(categoryId)
                    .orElseThrow(() -> ApiException.notFound("Kategori bulunamadı"));
            builder.category(category);
        }

        if (tagIds != null && !tagIds.isEmpty()) {
            Set<BlogTag> tags = new HashSet<>(blogTagRepository.findAllById(tagIds));
            builder.tags(tags);
        }

        if (scheduledAt != null) {
            builder.status("SCHEDULED").scheduledAt(scheduledAt);
        }

        return blogPostRepository.save(builder.build());
    }

    @Transactional
    public BlogPost updatePost(UUID postId, String title, String content, String excerpt,
                               UUID categoryId, Set<UUID> tagIds, String metaTitle, String metaDescription,
                               LocalDateTime scheduledAt, boolean isFeatured) {
        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> ApiException.notFound("Blog yazısı bulunamadı"));

        post.setTitle(title);
        post.setContent(content);
        post.setExcerpt(excerpt);
        post.setMetaTitle(metaTitle);
        post.setMetaDescription(metaDescription);
        post.setFeatured(isFeatured);

        if (categoryId != null) {
            post.setCategory(blogCategoryRepository.findById(categoryId).orElse(null));
        }

        if (tagIds != null) {
            post.setTags(new HashSet<>(blogTagRepository.findAllById(tagIds)));
        }

        if (scheduledAt != null) {
            post.setScheduledAt(scheduledAt);
            post.setStatus("SCHEDULED");
        }

        return blogPostRepository.save(post);
    }

    @Transactional
    public BlogPost publishPost(UUID postId) {
        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> ApiException.notFound("Blog yazısı bulunamadı"));
        post.setStatus("PUBLISHED");
        post.setPublishedAt(LocalDateTime.now());
        return blogPostRepository.save(post);
    }

    @Transactional
    public BlogPost unpublishPost(UUID postId) {
        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> ApiException.notFound("Blog yazısı bulunamadı"));
        post.setStatus("DRAFT");
        return blogPostRepository.save(post);
    }

    @Transactional
    public void deletePost(UUID postId) {
        blogPostRepository.deleteById(postId);
    }

    public Page<BlogPost> getAllPosts(Pageable pageable) {
        return blogPostRepository.findAll(pageable);
    }

    public long getPublishedCount() {
        return blogPostRepository.countByStatus("PUBLISHED");
    }

    @Transactional
    public BlogCategory createCategory(String name, String slug, String description) {
        return blogCategoryRepository.save(BlogCategory.builder()
                .name(name).slug(slug).description(description).build());
    }

    @Transactional
    public BlogTag createTag(String name, String slug) {
        return blogTagRepository.save(BlogTag.builder().name(name).slug(slug).build());
    }

    private String generateSlug(String title) {
        String base = title.toLowerCase(java.util.Locale.forLanguageTag("tr"))
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "-");
        String slug = base;
        int counter = 1;
        while (blogPostRepository.findBySlug(slug).isPresent()) {
            slug = base + "-" + counter++;
        }
        return slug;
    }
}
