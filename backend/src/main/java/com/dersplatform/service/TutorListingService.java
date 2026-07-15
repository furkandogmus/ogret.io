package com.dersplatform.service;

import com.dersplatform.exception.ApiException;
import com.dersplatform.model.dto.request.CreateListingRequest;
import com.dersplatform.model.dto.response.ListingResponse;
import com.dersplatform.model.entity.Subject;
import com.dersplatform.model.entity.TutorListing;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.Role;
import com.dersplatform.repository.SubjectRepository;
import com.dersplatform.repository.TutorListingRepository;
import com.dersplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TutorListingService {

    private final TutorListingRepository tutorListingRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    private static final Pattern PHONE_PATTERN = Pattern.compile(".*[0-9]{7,}.*");
    private static final Pattern EMAIL_PATTERN = Pattern
            .compile(".*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}.*");

    @Transactional
    public ListingResponse createListing(UUID tutorId, CreateListingRequest request) {
        User tutor = userRepository.findById(tutorId)
                .orElseThrow(() -> ApiException.notFound("Öğretmen bulunamadı"));

        if (tutor.getRole() != Role.TUTOR) {
            throw ApiException.badRequest("Sadece öğretmenler ilan oluşturabilir");
        }

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> ApiException.notFound("Ders konusu bulunamadı"));

        if (tutorListingRepository.findByTutorIdAndSubjectId(tutorId, request.getSubjectId()).isPresent()) {
            throw ApiException.conflict("Bu ders konusu için zaten bir ilanınız bulunuyor");
        }

        validateListingContent(request.getLessonDescription(), request.getAboutTutor());

        TutorListing listing = TutorListing.builder()
                .tutor(tutor)
                .subject(subject)
                .title(request.getTitle())
                .lessonDescription(request.getLessonDescription())
                .aboutTutor(request.getAboutTutor())
                .hourlyRate(request.getHourlyRate())
                .allowsTutorHome(request.isAllowsTutorHome())
                .allowsStudentHome(request.isAllowsStudentHome())
                .allowsOnline(request.isAllowsOnline())
                .maxTravelDistanceKm(request.getMaxTravelDistanceKm())
                .experienceYears(request.getExperienceYears())
                .languages(request.getLanguages() == null || request.getLanguages().isEmpty() ? List.of("Türkçe")
                        : request.getLanguages())
                .status("ACTIVE")
                .build();

        TutorListing savedListing = tutorListingRepository.save(listing);
        if (tutor.getHourlyRate() == null || tutor.getHourlyRate().compareTo(BigDecimal.ZERO) == 0) {
            tutor.setHourlyRate(request.getHourlyRate());
            userRepository.save(tutor);
        }
        return ListingResponse.fromEntity(savedListing);
    }

    @Transactional
    public ListingResponse updateListing(UUID tutorId, UUID listingId, CreateListingRequest request) {
        TutorListing listing = tutorListingRepository.findById(listingId)
                .orElseThrow(() -> ApiException.notFound("İlan bulunamadı"));

        if (!listing.getTutor().getId().equals(tutorId)) {
            throw ApiException.forbidden("Bu ilanı güncelleme yetkiniz yok");
        }

        validateListingContent(request.getLessonDescription(), request.getAboutTutor());

        listing.setTitle(request.getTitle());
        listing.setLessonDescription(request.getLessonDescription());
        listing.setAboutTutor(request.getAboutTutor());
        listing.setHourlyRate(request.getHourlyRate());
        listing.setAllowsTutorHome(request.isAllowsTutorHome());
        listing.setAllowsStudentHome(request.isAllowsStudentHome());
        listing.setAllowsOnline(request.isAllowsOnline());
        listing.setExperienceYears(request.getExperienceYears());
        listing.setMaxTravelDistanceKm(request.getMaxTravelDistanceKm());
        if (request.getLanguages() != null && !request.getLanguages().isEmpty()) {
            listing.setLanguages(request.getLanguages());
        }

        TutorListing savedListing = tutorListingRepository.save(listing);
        User tutor = listing.getTutor();
        if (tutor != null && (tutor.getHourlyRate() == null || tutor.getHourlyRate().compareTo(BigDecimal.ZERO) == 0)) {
            tutor.setHourlyRate(request.getHourlyRate());
            userRepository.save(tutor);
        }
        return ListingResponse.fromEntity(savedListing);
    }

    @Transactional
    public void deleteListing(UUID tutorId, UUID listingId) {
        TutorListing listing = tutorListingRepository.findById(listingId)
                .orElseThrow(() -> ApiException.notFound("İlan bulunamadı"));

        if (!listing.getTutor().getId().equals(tutorId)) {
            throw ApiException.forbidden("Bu ilanı silme yetkiniz yok");
        }

        tutorListingRepository.delete(listing);
    }

    public List<ListingResponse> getTutorListings(UUID tutorId, String status) {
        if (status != null && !status.isBlank()) {
            return tutorListingRepository.findByTutorIdAndStatusOrderByCreatedAtDesc(tutorId, status)
                    .stream().map(ListingResponse::fromEntity).toList();
        }
        return tutorListingRepository.findByTutorId(tutorId)
                .stream().map(ListingResponse::fromEntity).toList();
    }

    public ListingResponse getListingDetails(UUID listingId) {
        TutorListing listing = tutorListingRepository.findById(listingId)
                .orElseThrow(() -> ApiException.notFound("İlan bulunamadı"));
        return ListingResponse.fromEntity(listing);
    }

    public Page<ListingResponse> searchListings(UUID subjectId, BigDecimal minPrice, BigDecimal maxPrice,
            BigDecimal minRating, Boolean online, String sort, String q,
            Pageable pageable) {
        var locale = new java.util.Locale("tr", "TR");

        Sort dbSort;
        if (sort != null) {
            if ("price_asc".equals(sort)) {
                dbSort = Sort.by(Sort.Direction.ASC, "hourlyRate");
            } else if ("price_desc".equals(sort)) {
                dbSort = Sort.by(Sort.Direction.DESC, "hourlyRate");
            } else if ("rating".equals(sort)) {
                dbSort = Sort.by(Sort.Direction.DESC, "tutor.ratingAvg");
            } else {
                dbSort = Sort.by(Sort.Direction.DESC, "tutor.popularityScore");
            }
        } else {
            dbSort = Sort.by(Sort.Direction.DESC, "tutor.popularityScore");
        }

        Pageable cleanPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                dbSort);

        if (minRating != null || (q != null && !q.isBlank())) {
            List<TutorListing> all = tutorListingRepository.searchActiveListings(subjectId, minPrice, maxPrice, online,
                    q);

            var filtered = all.stream()
                    .filter(l -> {
                        if (minRating == null)
                            return true;
                        BigDecimal rating = l.getTutor().getRatingAvg();
                        return rating != null && rating.compareTo(minRating) >= 0;
                    })
                    .sorted(getComparator(sort))
                    .toList();

            int start = (int) cleanPageable.getOffset();
            int end = Math.min(start + cleanPageable.getPageSize(), filtered.size());
            List<ListingResponse> pageContent = start >= filtered.size()
                    ? List.of()
                    : filtered.subList(start, end).stream().map(ListingResponse::fromEntity).toList();

            return new PageImpl<>(pageContent, cleanPageable, filtered.size());
        }

        Page<TutorListing> paged = tutorListingRepository.searchActiveListingsPaged(subjectId, minPrice, maxPrice,
                online, q, cleanPageable);
        return paged.map(ListingResponse::fromEntity);
    }

    private Comparator<TutorListing> getComparator(String sort) {
        return (l1, l2) -> {
            if ("price_asc".equals(sort)) {
                return l1.getHourlyRate().compareTo(l2.getHourlyRate());
            } else if ("price_desc".equals(sort)) {
                return l2.getHourlyRate().compareTo(l1.getHourlyRate());
            } else if ("rating".equals(sort)) {
                BigDecimal r1 = l1.getTutor().getRatingAvg() != null ? l1.getTutor().getRatingAvg() : BigDecimal.ZERO;
                BigDecimal r2 = l2.getTutor().getRatingAvg() != null ? l2.getTutor().getRatingAvg() : BigDecimal.ZERO;
                return r2.compareTo(r1);
            } else {
                BigDecimal p1 = l1.getTutor().getPopularityScore() != null ? l1.getTutor().getPopularityScore()
                        : BigDecimal.ZERO;
                BigDecimal p2 = l2.getTutor().getPopularityScore() != null ? l2.getTutor().getPopularityScore()
                        : BigDecimal.ZERO;
                return p2.compareTo(p1);
            }
        };
    }

    public List<ListingResponse> searchByTrigramSimilarity(String query) {
        return tutorListingRepository.searchByTrigramSimilarity(query)
                .stream().map(ListingResponse::fromEntity).toList();
    }

    public List<Map<String, Object>> searchSubjectsByName(String query) {
        return subjectRepository.searchByName(query).stream()
                .map(s -> Map.<String, Object>of(
                        "id", s.getId().toString(),
                        "name", s.getName(),
                        "slug", s.getSlug(),
                        "category", s.getCategory().name()))
                .toList();
    }

    private void validateListingContent(String lessonDesc, String aboutTutor) {
        if (countWords(lessonDesc) < 50 || countWords(aboutTutor) < 50) {
            throw ApiException.badRequest("Açıklama alanları en az 50 kelime olmalıdır");
        }

        if (PHONE_PATTERN.matcher(lessonDesc).matches() || PHONE_PATTERN.matcher(aboutTutor).matches() ||
                EMAIL_PATTERN.matcher(lessonDesc).matches() || EMAIL_PATTERN.matcher(aboutTutor).matches()) {
            throw ApiException.badRequest("İletişim bilgisi veya web sitesi adresi eklenemez");
        }
    }

    private int countWords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        return text.trim().split("\\s+").length;
    }
}
