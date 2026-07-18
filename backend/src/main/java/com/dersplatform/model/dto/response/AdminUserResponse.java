package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AdminUserResponse {
    private UUID id;
    private String email;
    private String phone;
    private String fullName;
    private Role role;
    private boolean verified;
    private boolean profileComplete;
    private boolean identityVerified;
    private boolean online;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;

    public static AdminUserResponse fromEntity(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .role(user.getRole())
                .verified(user.isVerified())
                .profileComplete(user.isProfileComplete())
                .identityVerified(user.isIdentityVerified())
                .online(user.isOnline())
                .status(user.isProfileComplete() ? "READY" : "PROFILE_INCOMPLETE")
                .createdAt(user.getCreatedAt())
                .lastActiveAt(user.getLastActiveAt())
                .build();
    }
}
