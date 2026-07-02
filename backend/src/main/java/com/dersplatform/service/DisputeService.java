package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.entity.*;
import com.dersplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final DisputeMessageRepository disputeMessageRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;

    @Transactional
    public Dispute createDispute(UUID complainantId, UUID lessonId, String subject, String description) {
        User complainant = userRepository.findById(complainantId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> ApiException.notFound("Ders bulunamadı"));

        User respondent;
        if (complainantId.equals(lesson.getStudent().getId())) {
            respondent = lesson.getTutor();
        } else {
            respondent = lesson.getStudent();
        }

        return disputeRepository.save(Dispute.builder()
                .lesson(lesson)
                .complainant(complainant)
                .respondent(respondent)
                .subject(subject)
                .description(description)
                .status("OPEN")
                .priority("MEDIUM")
                .build());
    }

    public Page<Dispute> getMyDisputes(UUID userId, Pageable pageable) {
        return disputeRepository.findByComplainantIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Page<Dispute> getDisputesAgainstMe(UUID userId, Pageable pageable) {
        return disputeRepository.findByRespondentIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Dispute getDispute(UUID id, UUID userId) {
        Dispute dispute = disputeRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("İhtilaf bulunamadı"));

        boolean isParty = dispute.getComplainant().getId().equals(userId)
                || dispute.getRespondent().getId().equals(userId);

        if (!isParty && !userId.equals(getAdminId(dispute))) {
            throw ApiException.forbidden("Bu ihtilafa erişim yetkiniz yok");
        }

        return dispute;
    }

    @Transactional
    public DisputeMessage addMessage(UUID disputeId, UUID senderId, String message) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> ApiException.notFound("İhtilaf bulunamadı"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> ApiException.notFound("Kullanıcı bulunamadı"));

        return disputeMessageRepository.save(DisputeMessage.builder()
                .dispute(dispute)
                .sender(sender)
                .message(message)
                .build());
    }

    public List<DisputeMessage> getMessages(UUID disputeId, UUID userId) {
        Dispute dispute = getDispute(disputeId, userId);
        return disputeMessageRepository.findByDisputeIdOrderByCreatedAtAsc(disputeId);
    }

    @Transactional
    public Dispute resolveDispute(UUID disputeId, UUID adminId, String resolutionNotes) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> ApiException.notFound("İhtilaf bulunamadı"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> ApiException.notFound("Admin bulunamadı"));

        dispute.setStatus("RESOLVED");
        dispute.setAdmin(admin);
        dispute.setResolutionNotes(resolutionNotes);
        dispute.setResolvedAt(LocalDateTime.now());
        return disputeRepository.save(dispute);
    }

    public Page<Dispute> getAllDisputes(String status, Pageable pageable) {
        if (status != null && !status.isBlank()) {
            return disputeRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        }
        return disputeRepository.findAll(pageable);
    }

    private UUID getAdminId(Dispute dispute) {
        return dispute.getAdmin() != null ? dispute.getAdmin().getId() : null;
    }
}
