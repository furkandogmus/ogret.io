package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.enums.SubscriptionPlan;
import com.dersplatform.repository.SubscriptionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {
    @Mock private SubscriptionRepository subscriptionRepository;
    @Mock private TutorService tutorService;

    @Test
    void paidPlansAreUnavailableInFirstRelease() {
        SubscriptionService service = new SubscriptionService(subscriptionRepository, tutorService);

        assertThat(service.getPlans()).isEmpty();
        assertThatThrownBy(() -> service.subscribe(UUID.randomUUID(), SubscriptionPlan.PREMIUM, "card"))
                .isInstanceOfSatisfying(ApiException.class,
                        exception -> assertThat(exception.getStatus()).isEqualTo(HttpStatus.GONE));
        verifyNoInteractions(subscriptionRepository, tutorService);
    }
}
