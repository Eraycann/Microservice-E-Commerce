package org.kafka.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.dto.ProductDto;
import org.kafka.service.RecommendationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public List<ProductDto> getRecommendations(@AuthenticationPrincipal Jwt jwt) {
        // Token'dan userId'yi al
        String userId = jwt.getClaimAsString("sub");

        // Servisi çağır
        return recommendationService.getRecommendations(userId);
    }
}