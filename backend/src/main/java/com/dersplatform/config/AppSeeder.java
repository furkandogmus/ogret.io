package com.dersplatform.config;

import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.UserRepository;
import com.dersplatform.service.TutorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TutorService tutorService;

    @Override
    public void run(String... args) {
        List<UUID> seedIds = List.of(
                UUID.fromString("a0000000-0000-0000-0000-000000000001"),
                UUID.fromString("a0000000-0000-0000-0000-000000000002"),
                UUID.fromString("a0000000-0000-0000-0000-000000000003"),
                UUID.fromString("a0000000-0000-0000-0000-000000000004"),
                UUID.fromString("a0000000-0000-0000-0000-000000000005"),
                UUID.fromString("a0000000-0000-0000-0000-000000000006")
        );

        for (UUID id : seedIds) {
            userRepository.findById(id).ifPresent(user -> {
                if (user.getPasswordHash() == null || user.getPasswordHash().isEmpty()) {
                    user.setPasswordHash(passwordEncoder.encode("123456"));
                    userRepository.save(user);
                    log.info("Seed password set for: {}", user.getEmail());
                }
            });
        }

        var tutors = userRepository.findByRole(Role.TUTOR);
        tutors.forEach(t -> tutorService.computePopularityScore(t.getId()));
    }
}
