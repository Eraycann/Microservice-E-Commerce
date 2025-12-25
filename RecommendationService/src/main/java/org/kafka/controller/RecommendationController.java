package org.kafka.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.dto.ProductDto;
import org.kafka.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    // Hem Login hem Misafir destekler
    @GetMapping
    public List<ProductDto> getRecommendations(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestId
    ) {
        String userId = (jwt != null) ? jwt.getClaimAsString("sub") : null;

        return recommendationService.getRecommendations(userId, guestId);
    }

    @PostMapping("/train")
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<String> forceTrainModel() {
        return ResponseEntity.ok(recommendationService.triggerManualTraining());
    }
}