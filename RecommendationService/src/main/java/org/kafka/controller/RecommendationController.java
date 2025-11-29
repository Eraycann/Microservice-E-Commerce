package org.kafka.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.dto.ProductDto;
import org.kafka.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    // Herkes (Giriş yapmış kullanıcılar) erişebilir
    @GetMapping
    public List<ProductDto> getRecommendations(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("sub");
        return recommendationService.getRecommendations(userId);
    }

    // --- YENİ ADMIN ENDPOINT ---
    // Sadece 'superuser' rolüne sahip olanlar erişebilir
    // POST /api/recommendations/train
    @PostMapping("/train")
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<String> forceTrainModel() {
        String result = recommendationService.triggerManualTraining();
        return ResponseEntity.ok(result);
    }
}