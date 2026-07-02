package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.entity.LegalAgreement;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.entity.UserAgreementAcceptance;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.LegalAgreementRepository;
import com.dersplatform.repository.UserAgreementAcceptanceRepository;
import com.dersplatform.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LegalServiceTest {

    @Mock private LegalAgreementRepository legalAgreementRepository;
    @Mock private UserAgreementAcceptanceRepository userAgreementAcceptanceRepository;
    @Mock private UserRepository userRepository;

    private LegalService legalService;
    private LegalAgreement kvkkAgreement;
    private LegalAgreement cookiesAgreement;
    private User user;

    @BeforeEach
    void setUp() {
        legalService = new LegalService(legalAgreementRepository, userAgreementAcceptanceRepository, userRepository);

        user = User.builder()
                .id(UUID.randomUUID())
                .fullName("Test User")
                .role(Role.STUDENT)
                .build();

        kvkkAgreement = LegalAgreement.builder()
                .id(UUID.randomUUID())
                .title("KVKK Aydınlatma Metni")
                .slug("kvkk-aydinlatma")
                .content("KVKK metni içeriği")
                .isRequired(true)
                .isActive(true)
                .version(1)
                .build();

        cookiesAgreement = LegalAgreement.builder()
                .id(UUID.randomUUID())
                .title("Çerez Politikası")
                .slug("cerez-politikasi")
                .content("Çerez metni")
                .isRequired(false)
                .isActive(true)
                .version(1)
                .build();
    }

    @Test
    void getActiveAgreements_ShouldReturnOnlyActive() {
        LegalAgreement inactive = LegalAgreement.builder()
                .id(UUID.randomUUID()).title("Eski").slug("eski")
                .content("x").isActive(false).version(1)
                .build();

        when(legalAgreementRepository.findAll()).thenReturn(List.of(kvkkAgreement, cookiesAgreement, inactive));

        List<LegalAgreement> result = legalService.getActiveAgreements();

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(LegalAgreement::isActive));
    }

    @Test
    void getAgreementBySlug_ShouldReturn() {
        when(legalAgreementRepository.findBySlug("kvkk-aydinlatma")).thenReturn(Optional.of(kvkkAgreement));

        LegalAgreement result = legalService.getAgreementBySlug("kvkk-aydinlatma");

        assertEquals("KVKK Aydınlatma Metni", result.getTitle());
    }

    @Test
    void getAgreementBySlug_ShouldThrow_whenNotFound() {
        when(legalAgreementRepository.findBySlug("olmayan")).thenReturn(Optional.empty());

        assertThrows(ApiException.class, () -> legalService.getAgreementBySlug("olmayan"));
    }

    @Test
    void getUserAcceptances_ShouldReturnMap() {
        when(legalAgreementRepository.findAll()).thenReturn(List.of(kvkkAgreement, cookiesAgreement));
        when(userAgreementAcceptanceRepository.existsByUserIdAndAgreementSlug(user.getId(), "kvkk-aydinlatma"))
                .thenReturn(true);
        when(userAgreementAcceptanceRepository.existsByUserIdAndAgreementSlug(user.getId(), "cerez-politikasi"))
                .thenReturn(false);

        Map<String, Boolean> result = legalService.getUserAcceptances(user.getId());

        assertTrue(result.get("kvkk-aydinlatma"));
        assertFalse(result.get("cerez-politikasi"));
    }

    @Test
    void acceptAgreement_ShouldSave_whenNotAlreadyAccepted() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(request.getHeader("User-Agent")).thenReturn("JUnit");

        when(legalAgreementRepository.findBySlug("kvkk-aydinlatma")).thenReturn(Optional.of(kvkkAgreement));
        when(userAgreementAcceptanceRepository.existsByUserIdAndAgreementSlug(user.getId(), "kvkk-aydinlatma"))
                .thenReturn(false);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userAgreementAcceptanceRepository.save(any(UserAgreementAcceptance.class)))
                .thenAnswer(i -> i.getArgument(0));

        legalService.acceptAgreement(user.getId(), "kvkk-aydinlatma", request);

        verify(userAgreementAcceptanceRepository).save(any(UserAgreementAcceptance.class));
    }

    @Test
    void acceptAgreement_ShouldNotSave_whenAlreadyAccepted() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(legalAgreementRepository.findBySlug("kvkk-aydinlatma")).thenReturn(Optional.of(kvkkAgreement));
        when(userAgreementAcceptanceRepository.existsByUserIdAndAgreementSlug(user.getId(), "kvkk-aydinlatma"))
                .thenReturn(true);

        legalService.acceptAgreement(user.getId(), "kvkk-aydinlatma", request);

        verify(userAgreementAcceptanceRepository, never()).save(any());
    }

    @Test
    void acceptAgreement_ShouldThrow_whenAgreementNotFound() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(legalAgreementRepository.findBySlug("olmayan")).thenReturn(Optional.empty());

        assertThrows(ApiException.class,
                () -> legalService.acceptAgreement(user.getId(), "olmayan", request));
    }
}
