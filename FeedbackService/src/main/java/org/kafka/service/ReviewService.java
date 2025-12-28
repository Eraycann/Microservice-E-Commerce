package org.kafka.service;

import lombok.RequiredArgsConstructor;
import org.kafka.dto.ProductRatingSummary;
import org.kafka.dto.RestPage;
import org.kafka.dto.ReviewRequest;
import org.kafka.dto.ReviewResponse;
import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.code.FeedbackErrorCode;
import org.kafka.mapper.ReviewMapper;
import org.kafka.model.Review;
import org.kafka.repository.ReviewRepository;
import org.kafka.service.storage.StorageService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final StorageService storageService;
    private final MongoTemplate mongoTemplate;

    private static final int MAX_IMAGE_COUNT = 5;
    private static final List<String> BAD_WORDS = List.of("kötü", "berbat", "salak", "aptal");

    @CacheEvict(value = "product_reviews", key = "#request.productId")
    public ReviewResponse createReview(String userId, String userFullName, ReviewRequest request, List<MultipartFile> images) {
        try {
            System.out.println("=== REVIEW SERVICE DEBUG ===");
            System.out.println("UserId: " + userId);
            System.out.println("UserFullName: " + userFullName);
            System.out.println("Request: " + request);
            System.out.println("Images: " + (images != null ? images.size() : "null"));
            
            if (images != null && images.size() > MAX_IMAGE_COUNT) {
                throw new BaseDomainException(FeedbackErrorCode.TOO_MANY_IMAGES);
            }

            if (request.getRating() < 1 || request.getRating() > 5) {
                throw new BaseDomainException(FeedbackErrorCode.INVALID_RATING);
            }

            System.out.println("Checking if review already exists...");
            if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
                throw new BaseDomainException(FeedbackErrorCode.REVIEW_ALREADY_EXISTS);
            }

            System.out.println("Uploading images...");
            // Handle image uploads - pass empty list if images is null
            List<String> uploadedImageUrls = storageService.uploadImages(images != null ? images : List.of());
            System.out.println("Uploaded image URLs: " + uploadedImageUrls);
            
            String cleanComment = filterBadWords(request.getComment());
            System.out.println("Clean comment: " + cleanComment);

            System.out.println("Mapping to entity...");
            Review review = reviewMapper.toEntity(request);
            review.setUserId(userId);
            review.setUserFullName(userFullName);
            review.setComment(cleanComment);
            review.setImageUrls(uploadedImageUrls);

            System.out.println("Saving review...");
            Review savedReview = reviewRepository.save(review);
            System.out.println("Saved review ID: " + savedReview.getId());
            
            System.out.println("Mapping to response...");
            ReviewResponse response = reviewMapper.toResponse(savedReview);
            System.out.println("=== REVIEW SERVICE SUCCESS ===");
            
            return response;
            
        } catch (Exception e) {
            System.err.println("=== REVIEW SERVICE ERROR ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.err.println("=== END SERVICE ERROR ===");
            throw e;
        }
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Review saveReview(Review review) {
        return reviewRepository.save(review);
    }

    //@Cacheable(value = "product_reviews", key = "#productId + '-' + #pageable.pageNumber")
    public Page<ReviewResponse> getReviewsByProductId(String productId, Pageable pageable) {
        System.out.println("=== REVIEW SERVICE GET REVIEWS ===");
        System.out.println("ProductId: " + productId);
        System.out.println("Pageable: " + pageable);
        
        Page<Review> reviews = reviewRepository.findByProductId(productId, pageable);
        System.out.println("Found reviews from DB: " + reviews.getTotalElements());
        
        if (!reviews.getContent().isEmpty()) {
            System.out.println("First review from DB: " + reviews.getContent().get(0));
        }

        List<ReviewResponse> dtoList = reviews.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        System.out.println("Mapped DTOs count: " + dtoList.size());
        if (!dtoList.isEmpty()) {
            System.out.println("First mapped DTO: " + dtoList.get(0));
            System.out.println("First DTO image URLs: " + dtoList.get(0).getImageUrls());
        }

        Page<ReviewResponse> result = new RestPage<>(dtoList, pageable, reviews.getTotalElements());
        System.out.println("=== REVIEW SERVICE SUCCESS ===");
        return result;
    }

    public ProductRatingSummary getProductRatingSummary(String productId) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("productId").is(productId)),
                Aggregation.group("rating").count().as("count")
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "reviews", Map.class);
        List<Map> mappedResults = results.getMappedResults();

        long totalReviews = 0;
        long totalStars = 0;
        Map<Integer, Long> starCounts = new HashMap<>();

        for (Map entry : mappedResults) {
            int star = (Integer) entry.get("_id");
            long count = ((Number) entry.get("count")).longValue();

            starCounts.put(star, count);
            totalReviews += count;
            totalStars += (star * count);
        }

        double average = totalReviews > 0 ? (double) totalStars / totalReviews : 0.0;

        return new ProductRatingSummary(productId, average, totalReviews, starCounts);
    }

    private String filterBadWords(String text) {
        String filtered = text;
        for (String word : BAD_WORDS) {
            filtered = filtered.replaceAll("(?i)" + word, "***");
        }
        return filtered;
    }

    public void voteReview(String reviewId) {
        Update update = new Update().inc("helpfulCount", 1);
        Query query = Query.query(Criteria.where("id").is(reviewId));
        mongoTemplate.updateFirst(query, update, Review.class);
    }
}