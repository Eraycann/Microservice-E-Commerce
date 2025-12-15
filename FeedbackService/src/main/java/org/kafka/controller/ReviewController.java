package org.kafka.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.dto.ProductRatingSummary;
import org.kafka.dto.ReviewRequest;
import org.kafka.dto.ReviewResponse;
import org.kafka.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // Yorum Yap (Multipart/Form-Data)
    // Frontend isteği şöyle atacak:
    // Form Data:
    // - review: { "productId": "123", "comment": "...", "rating": 5 } (Content-Type: application/json)
    // - images: [file1.jpg, file2.png]
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ReviewResponse addReview(
            @AuthenticationPrincipal Jwt jwt,
            @RequestPart("review") ReviewRequest request, // JSON Verisi
            @RequestPart(value = "images", required = false) List<MultipartFile> images // Dosyalar
    ) {
        String userId = jwt.getClaimAsString("sub");
        String fullName = jwt.getClaimAsString("name");

        return reviewService.createReview(userId, fullName, request, images);
    }

    @GetMapping("/{productId}")
    public Page<ReviewResponse> getReviews(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return reviewService.getReviewsByProductId(productId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    // ... mevcut kodlar ...

    // Ürün Puan İstatistiklerini Getir
    // GET /api/reviews/summary/{productId}
    @GetMapping("/summary/{productId}")
    public ProductRatingSummary getSummary(@PathVariable String productId) {
        return reviewService.getProductRatingSummary(productId);
    }

    // Yoruma "Faydalı" Oyu Ver
    // POST /api/reviews/{reviewId}/vote
    @PostMapping("/{reviewId}/vote")
    public void voteReview(@PathVariable String reviewId) {
        reviewService.voteReview(reviewId);
    }
}