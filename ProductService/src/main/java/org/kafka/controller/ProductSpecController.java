package org.kafka.controller;

import org.kafka.dto.SpecsUpdateRequestDto;
import org.kafka.dto.ProductDetailResponseDto;
import org.kafka.service.ProductSpecService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/products/{productId}/specs")
@RequiredArgsConstructor
public class ProductSpecController {

    private final ProductSpecService specService;

    @PutMapping
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<ProductDetailResponseDto> updateProductSpecs(
            @PathVariable Long productId,
            @Valid @RequestBody SpecsUpdateRequestDto request) {

        ProductDetailResponseDto response = specService.updateSpecs(productId, request);
        return ResponseEntity.ok(response);
    }
}
