package org.kafka.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.dto.ProductRatingSummary;
import org.kafka.dto.ReviewRequest;
import org.kafka.dto.ReviewResponse;
import org.kafka.mapper.ReviewMapper;
import org.kafka.model.Review;
import org.kafka.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewMapper reviewMapper;

    // 👇 BURASI KRİTİK: Hatayı yakalayıp sana söyleyecek yapı
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addReview(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("productId") String productId,
            @RequestParam("rating") Integer rating,
            @RequestParam("comment") String comment,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            // 1. Log Başlangıç
            System.out.println(">>> İSTEK GELDİ: ProductId=" + productId);

            // 2. JWT Kontrol
            if (jwt == null) {
                return ResponseEntity.status(401).body("HATA: JWT Token bulunamadı (Oturum kapalı görünüyor)");
            }

            String userId = jwt.getClaimAsString("sub");
            String fullName = jwt.getClaimAsString("name");
            System.out.println(">>> KULLANICI: " + fullName + " (" + userId + ")");

            // 3. Veri Hazırlama
            ReviewRequest request = new ReviewRequest();
            request.setProductId(productId);
            request.setRating(rating != null ? rating : 5);
            request.setComment(comment);
            request.setImageUrls(new ArrayList<>()); // Null Safety

            // Resim listesi null ise boş liste yap
            List<MultipartFile> safeImages = (images != null) ? images : new ArrayList<>();
            System.out.println(">>> RESİM SAYISI: " + safeImages.size());

            // 4. Servise Git (Hata buranın içinde oluyor muhtemelen)
            ReviewResponse response = reviewService.createReview(userId, fullName, request, safeImages);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // 🛑 HATAYI YAKALA VE LOG'A BAS
            System.err.println("!!! PATLADI !!!");
            e.printStackTrace();

            // 🛑 HATAYI FRONTEND'E GÖNDER (Böylece tarayıcıda görebileceksin)
            String hataMesaji = "SUNUCU HATASI: " + e.getClass().getSimpleName() + " -> " + e.getMessage();
            if (e.getCause() != null) {
                hataMesaji += " || SEBEP: " + e.getCause().getMessage();
            }

            return ResponseEntity.status(500).body(Map.of("error", hataMesaji));
        }
    }

    @GetMapping("/migrate-image-urls")
    public String migrateImageUrls() {
        System.out.println(">>> IMAGE URL MİGRATION BAŞLADI");
        
        List<Review> allReviews = reviewService.getAllReviews();
        int updatedCount = 0;
        
        for (Review review : allReviews) {
            if (review.getImageUrls() != null && !review.getImageUrls().isEmpty()) {
                List<String> updatedUrls = new ArrayList<>();
                boolean needsUpdate = false;
                
                for (String imageUrl : review.getImageUrls()) {
                    if (imageUrl.startsWith("/uploads/")) {
                        // Eski format: /uploads/filename
                        String filename = imageUrl.substring("/uploads/".length());
                        String newUrl = "http://localhost:8080/feedback-service/uploads/" + filename;
                        updatedUrls.add(newUrl);
                        needsUpdate = true;
                        System.out.println(">>> URL GÜNCELLENDİ: " + imageUrl + " -> " + newUrl);
                    } else {
                        updatedUrls.add(imageUrl);
                    }
                }
                
                if (needsUpdate) {
                    review.setImageUrls(updatedUrls);
                    reviewService.saveReview(review);
                    updatedCount++;
                }
            }
        }
        
        System.out.println(">>> MİGRATION TAMAMLANDI: " + updatedCount + " review güncellendi");
        return "Migration completed. Updated " + updatedCount + " reviews.";
    }

    @GetMapping("/all")
    public List<ReviewResponse> getAllReviews() {
        System.out.println(">>> TÜM REVIEWS İSTEĞİ GELDİ");
        List<Review> allReviews = reviewService.getAllReviews();
        System.out.println(">>> TOPLAM REVIEW SAYISI: " + allReviews.size());
        
        List<ReviewResponse> responses = allReviews.stream()
                .map(review -> {
                    ReviewResponse response = reviewMapper.toResponse(review);
                    System.out.println(">>> REVIEW: ProductId=" + review.getProductId() + ", User=" + review.getUserFullName() + ", Rating=" + review.getRating());
                    return response;
                })
                .toList();
        
        return responses;
    }

    @GetMapping("/{productId}")
    public Page<ReviewResponse> getReviews(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        System.out.println(">>> REVIEWS İSTEĞİ GELDİ: ProductId=" + productId + ", page=" + page + ", size=" + size);
        
        Page<ReviewResponse> result = reviewService.getReviewsByProductId(productId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        
        System.out.println(">>> REVIEWS SONUCU: " + result.getTotalElements() + " toplam yorum, " + result.getContent().size() + " sayfa içeriği");
        if (!result.getContent().isEmpty()) {
            System.out.println(">>> İLK YORUM: " + result.getContent().get(0));
        }
        
        return result;
    }

    @GetMapping("/summary/{productId}")
    public ProductRatingSummary getSummary(@PathVariable String productId) {
        return reviewService.getProductRatingSummary(productId);
    }

    @PostMapping("/{reviewId}/vote")
    public void voteReview(@PathVariable String reviewId) {
        reviewService.voteReview(reviewId);
    }
}