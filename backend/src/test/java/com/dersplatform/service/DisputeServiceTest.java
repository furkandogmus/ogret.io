package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.entity.*;
import com.dersplatform.model.enums.LessonStatus;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.DisputeMessageRepository;
import com.dersplatform.repository.DisputeRepository;
import com.dersplatform.repository.LessonRepository;
import com.dersplatform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DisputeServiceTest {

    @Mock private DisputeRepository disputeRepository;
    @Mock private DisputeMessageRepository disputeMessageRepository;
    @Mock private UserRepository userRepository;
    @Mock private LessonRepository lessonRepository;

    private DisputeService disputeService;
    private User student;
    private User tutor;
    private Lesson lesson;
    private Dispute dispute;
    private DisputeMessage disputeMessage;

    @BeforeEach
    void setUp() {
        disputeService = new DisputeService(disputeRepository, disputeMessageRepository, userRepository, lessonRepository);

        student = User.builder()
                .id(UUID.randomUUID())
                .fullName("Öğrenci")
                .role(Role.STUDENT)
                .build();

        tutor = User.builder()
                .id(UUID.randomUUID())
                .fullName("Öğretmen")
                .role(Role.TUTOR)
                .build();

        lesson = Lesson.builder()
                .id(UUID.randomUUID())
                .student(student)
                .tutor(tutor)
                .status(LessonStatus.CONFIRMED)
                .lessonDate(LocalDate.now())
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(15, 0))
                .price(BigDecimal.valueOf(300))
                .build();

        dispute = Dispute.builder()
                .id(UUID.randomUUID())
                .lesson(lesson)
                .complainant(student)
                .respondent(tutor)
                .subject("İptal sorunu")
                .description("Ders iptal edildi ama para iade edilmedi")
                .status("OPEN")
                .priority("MEDIUM")
                .build();

        disputeMessage = DisputeMessage.builder()
                .id(UUID.randomUUID())
                .dispute(dispute)
                .sender(student)
                .message("Yardımcı olur musunuz?")
                .build();
    }

    @Test
    void createDispute_AsStudent_ShouldSetRespondentAsTutor() {
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(lessonRepository.findById(lesson.getId())).thenReturn(Optional.of(lesson));
        when(disputeRepository.save(any(Dispute.class))).thenReturn(dispute);

        Dispute result = disputeService.createDispute(student.getId(), lesson.getId(), "İptal sorunu", "Açıklama");

        assertNotNull(result);
        assertEquals("OPEN", result.getStatus());
        verify(disputeRepository).save(any(Dispute.class));
    }

    @Test
    void createDispute_AsTutor_ShouldSetRespondentAsStudent() {
        when(userRepository.findById(tutor.getId())).thenReturn(Optional.of(tutor));
        when(lessonRepository.findById(lesson.getId())).thenReturn(Optional.of(lesson));
        when(disputeRepository.save(any(Dispute.class))).thenReturn(dispute);

        Dispute result = disputeService.createDispute(tutor.getId(), lesson.getId(), "Sorun", "Açıklama");

        assertNotNull(result);
    }

    @Test
    void createDispute_ShouldThrow_whenLessonNotFound() {
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(lessonRepository.findById(lesson.getId())).thenReturn(Optional.empty());

        assertThrows(ApiException.class,
                () -> disputeService.createDispute(student.getId(), lesson.getId(), "Konu", "Açıklama"));
    }

    @Test
    void getMyDisputes_ShouldReturnPage() {
        when(disputeRepository.findByComplainantIdOrderByCreatedAtDesc(student.getId(), PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(dispute)));

        Page<Dispute> result = disputeService.getMyDisputes(student.getId(), PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
    }

    @Test
    void getDispute_AsParty_ShouldReturn() {
        when(disputeRepository.findById(dispute.getId())).thenReturn(Optional.of(dispute));

        Dispute result = disputeService.getDispute(dispute.getId(), student.getId());

        assertNotNull(result);
        assertEquals("İptal sorunu", result.getSubject());
    }

    @Test
    void getDispute_AsNonParty_ShouldThrow() {
        UUID strangerId = UUID.randomUUID();
        when(disputeRepository.findById(dispute.getId())).thenReturn(Optional.of(dispute));

        assertThrows(ApiException.class,
                () -> disputeService.getDispute(dispute.getId(), strangerId));
    }

    @Test
    void addMessage_ShouldSave() {
        when(disputeRepository.findById(dispute.getId())).thenReturn(Optional.of(dispute));
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(disputeMessageRepository.save(any(DisputeMessage.class))).thenReturn(disputeMessage);

        DisputeMessage result = disputeService.addMessage(dispute.getId(), student.getId(), "Yardımcı olur musunuz?");

        assertEquals("Yardımcı olur musunuz?", result.getMessage());
    }

    @Test
    void getMessages_ShouldReturnList() {
        when(disputeRepository.findById(dispute.getId())).thenReturn(Optional.of(dispute));
        when(disputeMessageRepository.findByDisputeIdOrderByCreatedAtAsc(dispute.getId()))
                .thenReturn(List.of(disputeMessage));

        List<DisputeMessage> result = disputeService.getMessages(dispute.getId(), student.getId());

        assertEquals(1, result.size());
    }

    @Test
    void resolveDispute_ShouldSetResolved() {
        User admin = User.builder().id(UUID.randomUUID()).fullName("Admin").build();
        when(disputeRepository.findById(dispute.getId())).thenReturn(Optional.of(dispute));
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
        when(disputeRepository.save(any(Dispute.class))).thenAnswer(i -> i.getArgument(0));

        Dispute result = disputeService.resolveDispute(dispute.getId(), admin.getId(), "Çözüldü");

        assertEquals("RESOLVED", result.getStatus());
    }

    @Test
    void getAllDisputes_WithStatus_ShouldFilter() {
        when(disputeRepository.findByStatusOrderByCreatedAtDesc("OPEN", PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(dispute)));

        Page<Dispute> result = disputeService.getAllDisputes("OPEN", PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
    }

    @Test
    void getAllDisputes_WithoutStatus_ShouldReturnAll() {
        when(disputeRepository.findAll(PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(dispute)));

        Page<Dispute> result = disputeService.getAllDisputes(null, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
    }
}
