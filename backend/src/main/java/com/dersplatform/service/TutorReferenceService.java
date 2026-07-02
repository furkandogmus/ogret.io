package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.CreateReferenceRequest;
import com.dersplatform.model.dto.response.ReferenceResponse;
import com.dersplatform.model.entity.TutorReference;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.model.enums.VerificationStatus;
import com.dersplatform.repository.TutorReferenceRepository;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TutorReferenceService {

    private final TutorReferenceRepository tutorReferenceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public ReferenceResponse createReference(UUID tutorId, CreateReferenceRequest request) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> ApiException.notFound("Öğretmen bulunamadı"));

        if (tutor.getRole() != Role.TUTOR) {
            throw ApiException.badRequest("Yalnızca öğretmenler için referans yazılabilir");
        }

        TutorReference reference = TutorReference.builder()
                .tutor(tutor)
                .recommenderName(request.getRecommenderName())
                .recommenderEmail(request.getRecommenderEmail())
                .recommenderTitle(request.getRecommenderTitle())
                .comment(request.getComment())
                .status(VerificationStatus.PENDING)
                .build();

        reference = tutorReferenceRepository.save(reference);
        return ReferenceResponse.fromEntity(reference);
    }

    public List<ReferenceResponse> getApprovedReferences(UUID tutorId) {
        return tutorReferenceRepository.findByTutorIdAndStatusOrderByCreatedAtDesc(tutorId, VerificationStatus.APPROVED)
                .stream()
                .map(ReferenceResponse::fromEntity)
                .toList();
    }

    public List<ReferenceResponse> getTutorReferences(UUID tutorId) {
        return tutorReferenceRepository.findByTutorIdOrderByCreatedAtDesc(tutorId)
                .stream()
                .map(ReferenceResponse::fromEntity)
                .toList();
    }

    public List<ReferenceResponse> getPendingReferences() {
        return tutorReferenceRepository.findByStatusOrderByCreatedAtDesc(VerificationStatus.PENDING)
                .stream()
                .map(ReferenceResponse::fromEntity)
                .toList();
    }

    @Transactional
    public void updateReferenceStatus(UUID referenceId, boolean approved) {
        TutorReference reference = tutorReferenceRepository.findById(referenceId)
                .orElseThrow(() -> ApiException.notFound("Referans bulunamadı"));

        reference.setStatus(approved ? VerificationStatus.APPROVED : VerificationStatus.REJECTED);
        tutorReferenceRepository.save(reference);

        // Notify the tutor when their reference is approved
        if (approved) {
            notificationService.notifyReferenceApproved(
                    reference.getTutor(), reference.getRecommenderName());
        }
    }
}
