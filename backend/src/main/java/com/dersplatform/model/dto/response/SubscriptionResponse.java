package com.dersplatform.model.dto.response;

import com.dersplatform.model.entity.Subscription;
import com.dersplatform.model.enums.SubscriptionPlan;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record SubscriptionResponse(
        UUID id,
        SubscriptionPlan planType,
        BigDecimal price,
        LocalDateTime startDate,
        LocalDateTime endDate,
        boolean isActive,
        String paymentMethod
) {
    public static SubscriptionResponse fromEntity(Subscription sub) {
        return new SubscriptionResponse(
                sub.getId(),
                sub.getPlanType(),
                sub.getPrice(),
                sub.getStartDate(),
                sub.getEndDate(),
                sub.isActive(),
                sub.getPaymentMethod()
        );
    }
}
