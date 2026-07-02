package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.response.SubscriptionResponse;
import com.dersplatform.model.entity.Subscription;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.SubscriptionPlan;
import com.dersplatform.repository.SubscriptionRepository;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final TutorService tutorService;

    public List<Map<String, Object>> getPlans() {
        return List.of(
                Map.of("id", "basic", "name", "BASIC", "price", 49, "features", List.of("Standart profil", "10 ders talebi/ay")),
                Map.of("id", "premium", "name", "PREMIUM", "price", 99, "features", List.of("Öne çıkan profil", "Limitsiz talep", "İstatistikler")),
                Map.of("id", "vip", "name", "VIP", "price", 199, "features", List.of("En üstte listeleme", "Öncelikli destek", "Kimlik doğrulama rozeti"))
        );
    }

    @Transactional
    public SubscriptionResponse subscribe(UUID tutorId, SubscriptionPlan planType, String paymentMethod) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> ApiException.notFound("Öğretmen bulunamadı"));

        subscriptionRepository.findByTutorIdAndIsActiveTrue(tutorId)
                .ifPresent(s -> {
                    s.setActive(false);
                    subscriptionRepository.save(s);
                });

        BigDecimal price = switch (planType) {
            case BASIC -> BigDecimal.valueOf(49);
            case PREMIUM -> BigDecimal.valueOf(99);
            case VIP -> BigDecimal.valueOf(199);
        };

        Subscription subscription = Subscription.builder()
                .tutor(tutor)
                .planType(planType)
                .price(price)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .isActive(true)
                .paymentMethod(paymentMethod)
                .build();

        subscription = subscriptionRepository.save(subscription);
        tutorService.computePopularityScore(tutorId);
        return SubscriptionResponse.fromEntity(subscription);
    }

    public SubscriptionResponse getMySubscription(UUID tutorId) {
        return subscriptionRepository.findByTutorIdAndIsActiveTrue(tutorId)
                .map(SubscriptionResponse::fromEntity)
                .orElseThrow(() -> ApiException.notFound("Aktif aboneliğiniz bulunmuyor"));
    }

    @Transactional
    public void cancelSubscription(UUID tutorId) {
        Subscription subscription = subscriptionRepository.findByTutorIdAndIsActiveTrue(tutorId)
                .orElseThrow(() -> ApiException.notFound("Aktif aboneliğiniz bulunmuyor"));
        subscription.setActive(false);
        subscriptionRepository.save(subscription);
        tutorService.computePopularityScore(tutorId);
    }
}
