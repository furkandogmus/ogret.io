package com.dersplatform.repository;

import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

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
}
