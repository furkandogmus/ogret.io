package com.dersplatform.repository;

import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    long countByRole(Role role);
    Page<User> findByRole(Role role, Pageable pageable);
    List<User> findByRole(Role role);
    Page<User> findByIdIn(List<UUID> ids, Pageable pageable);
    Page<User> findByRoleAndIdIn(Role role, List<UUID> ids, Pageable pageable);
    List<User> findByFullNameContainingIgnoreCase(String name);

    @Query(value = """
        SELECT * FROM users u
        WHERE u.deleted_at IS NULL
        AND (:query IS NULL OR :query = '' OR
               u.search_vector IS NOT NULL AND
               u.search_vector @@ plainto_tsquery('turkish', :query || ''))
        ORDER BY
            CASE WHEN :query IS NOT NULL AND :query <> '' AND u.search_vector IS NOT NULL
                 THEN ts_rank(u.search_vector, plainto_tsquery('turkish', :query || ''))
                 ELSE 0 END DESC
        """, nativeQuery = true)
    List<User> searchByFullText(@Param("query") String query);

    @Query(value = """
        SELECT u FROM User u
        WHERE function('similarity', u.fullName, :query) > 0.3
        ORDER BY function('similarity', u.fullName, :query) DESC
        """)
    List<User> searchByTrigramSimilarity(@Param("query") String query);
}
