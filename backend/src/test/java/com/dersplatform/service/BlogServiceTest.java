package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.entity.BlogCategory;
import com.dersplatform.model.entity.BlogPost;
import com.dersplatform.model.entity.BlogTag;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.BlogCategoryRepository;
import com.dersplatform.repository.BlogPostRepository;
import com.dersplatform.repository.BlogTagRepository;
import com.dersplatform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlogServiceTest {

    @Mock private BlogPostRepository blogPostRepository;
    @Mock private BlogCategoryRepository blogCategoryRepository;
    @Mock private BlogTagRepository blogTagRepository;
    @Mock private UserRepository userRepository;

    private BlogService blogService;
    private User author;
    private BlogCategory category;
    private BlogTag tag;
    private BlogPost post;

    @BeforeEach
    void setUp() {
        blogService = new BlogService(blogPostRepository, blogCategoryRepository, blogTagRepository, userRepository);

        author = User.builder()
                .id(UUID.randomUUID())
                .fullName("Yazar")
                .role(Role.ADMIN)
                .build();

        category = BlogCategory.builder()
                .id(UUID.randomUUID())
                .name("Eğitim")
                .slug("egitim")
                .build();

        tag = BlogTag.builder()
                .id(UUID.randomUUID())
                .name("LGS")
                .slug("lgs")
                .build();

        post = BlogPost.builder()
                .id(UUID.randomUUID())
                .title("Test Post")
                .slug("test-post")
                .content("Test content")
                .author(author)
                .category(category)
                .tags(Set.of(tag))
                .status("PUBLISHED")
                .publishedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getPublishedPosts_ShouldReturnPage() {
        Page<BlogPost> page = new PageImpl<>(List.of(post));
        when(blogPostRepository.findByStatusOrderByPublishedAtDesc("PUBLISHED", PageRequest.of(0, 10)))
                .thenReturn(page);

        Page<BlogPost> result = blogService.getPublishedPosts(null, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
        assertEquals("Test Post", result.getContent().get(0).getTitle());
    }

    @Test
    void getPublishedPosts_WithCategoryId_ShouldFilterByCategory() {
        UUID catId = category.getId();
        when(blogPostRepository.findByStatusAndCategoryIdOrderByPublishedAtDesc("PUBLISHED", catId, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(post)));

        Page<BlogPost> result = blogService.getPublishedPosts(catId, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
    }

    @Test
    void getPostBySlug_ShouldReturnPost() {
        when(blogPostRepository.findBySlug("test-post")).thenReturn(Optional.of(post));

        BlogPost result = blogService.getPostBySlug("test-post");

        assertEquals("Test Post", result.getTitle());
    }

    @Test
    void getPostBySlug_ShouldThrow_whenNotFound() {
        when(blogPostRepository.findBySlug("olmayan")).thenReturn(Optional.empty());

        assertThrows(ApiException.class, () -> blogService.getPostBySlug("olmayan"));
    }

    @Test
    void incrementViewCount_ShouldIncrement() {
        when(blogPostRepository.findById(post.getId())).thenReturn(Optional.of(post));
        when(blogPostRepository.save(any(BlogPost.class))).thenAnswer(i -> i.getArgument(0));

        blogService.incrementViewCount(post.getId());

        assertEquals(1, post.getViewCount());
    }

    @Test
    void createPost_ShouldReturnSavedPost() {
        when(userRepository.findById(author.getId())).thenReturn(Optional.of(author));
        when(blogPostRepository.findBySlug(anyString())).thenReturn(Optional.empty());
        when(blogPostRepository.save(any(BlogPost.class))).thenReturn(post);

        BlogPost result = blogService.createPost(
                "Test Post", "Content", "Excerpt", author.getId(),
                category.getId(), Set.of(tag.getId()),
                "Meta", "Desc", null, false);

        assertNotNull(result);
        verify(blogPostRepository).save(any(BlogPost.class));
    }

    @Test
    void publishPost_ShouldSetStatusToPublished() {
        post.setStatus("DRAFT");
        when(blogPostRepository.findById(post.getId())).thenReturn(Optional.of(post));
        when(blogPostRepository.save(any(BlogPost.class))).thenAnswer(i -> i.getArgument(0));

        BlogPost result = blogService.publishPost(post.getId());

        assertEquals("PUBLISHED", result.getStatus());
    }

    @Test
    void unpublishPost_ShouldSetStatusToDraft() {
        when(blogPostRepository.findById(post.getId())).thenReturn(Optional.of(post));
        when(blogPostRepository.save(any(BlogPost.class))).thenAnswer(i -> i.getArgument(0));

        BlogPost result = blogService.unpublishPost(post.getId());

        assertEquals("DRAFT", result.getStatus());
    }

    @Test
    void deletePost_ShouldCallRepository() {
        blogService.deletePost(post.getId());
        verify(blogPostRepository).deleteById(post.getId());
    }

    @Test
    void getAllCategories_ShouldReturnList() {
        when(blogCategoryRepository.findAll()).thenReturn(List.of(category));
        assertEquals(1, blogService.getAllCategories().size());
    }

    @Test
    void getAllTags_ShouldReturnList() {
        when(blogTagRepository.findAll()).thenReturn(List.of(tag));
        assertEquals(1, blogService.getAllTags().size());
    }

    @Test
    void getPublishedCount_ShouldReturnCount() {
        when(blogPostRepository.countByStatus("PUBLISHED")).thenReturn(5L);
        assertEquals(5L, blogService.getPublishedCount());
    }

    @Test
    void createCategory_ShouldSaveAndReturn() {
        when(blogCategoryRepository.save(any(BlogCategory.class))).thenReturn(category);
        assertNotNull(blogService.createCategory("Eğitim", "egitim", "desc"));
    }

    @Test
    void createTag_ShouldSaveAndReturn() {
        when(blogTagRepository.save(any(BlogTag.class))).thenReturn(tag);
        assertNotNull(blogService.createTag("LGS", "lgs"));
    }
}
