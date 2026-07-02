package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.entity.LegalAgreement;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.entity.UserAgreementAcceptance;
import com.dersplatform.repository.LegalAgreementRepository;
import com.dersplatform.repository.UserAgreementAcceptanceRepository;
import com.dersplatform.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LegalService {

    private final LegalAgreementRepository legalAgreementRepository;
    private final UserAgreementAcceptanceRepository userAgreementAcceptanceRepository;
    private final UserRepository userRepository;

    public List<LegalAgreement> getActiveAgreements() {
        return legalAgreementRepository.findAll().stream()
                .filter(LegalAgreement::isActive)
                .toList();
    }

    public LegalAgreement getAgreementBySlug(String slug) {
        return legalAgreementRepository.findBySlug(slug)
                .orElseThrow(() -> ApiException.notFound("Sözleşme bulunamadı"));
    }

    public Map<String, Boolean> getUserAcceptances(UUID userId) {
        List<LegalAgreement> active = getActiveAgreements();
        return active.stream()
                .collect(Collectors.toMap(
                        LegalAgreement::getSlug,
                        a -> userAgreementAcceptanceRepository
                                .existsByUserIdAndAgreementSlug(userId, a.getSlug())
                ));
    }

    @Transactional
    public void acceptAgreement(UUID userId, String slug, HttpServletRequest request) {
        LegalAgreement agreement = legalAgreementRepository.findBySlug(slug)
                .orElseThrow(() -> ApiException.notFound("Sözleşme bulunamadı"));

        if (userAgreementAcceptanceRepository
                .existsByUserIdAndAgreementSlug(userId, slug)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        userAgreementAcceptanceRepository.save(UserAgreementAcceptance.builder()
                .user(user)
                .agreement(agreement)
                .ipAddress(request.getRemoteAddr())
                .userAgent(request.getHeader("User-Agent"))
                .build());
    }
}
