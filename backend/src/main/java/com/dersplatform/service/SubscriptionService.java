package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.response.SubscriptionResponse;
import com.dersplatform.model.entity.Subscription;
import com.dersplatform.model.enums.SubscriptionPlan;
import com.dersplatform.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final TutorService tutorService;

    public List<Map<String, Object>> getPlans() {
        return List.of();
    }

    @Transactional
    public SubscriptionResponse subscribe(UUID tutorId, SubscriptionPlan planType, String paymentMethod) {
        throw ApiException.gone(
                "Ücretli abonelikler ilk sürümde kapalıdır; ödeme veya abonelik oluşturulamaz");
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
