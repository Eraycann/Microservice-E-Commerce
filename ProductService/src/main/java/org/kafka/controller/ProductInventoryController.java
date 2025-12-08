package org.kafka.controller;

import org.kafka.dto.StockUpdateRequestDto;
import org.kafka.dto.ProductDetailResponseDto;
import org.kafka.service.ProductInventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/products/{productId}/stock")
@RequiredArgsConstructor
public class ProductInventoryController {

    private final ProductInventoryService inventoryService;

    @PutMapping
    @PreAuthorize("hasAnyRole('superuser')")
    public ResponseEntity<ProductDetailResponseDto> updateProductStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequestDto request) {

        ProductDetailResponseDto response = inventoryService.updateStock(productId, request);
        return ResponseEntity.ok(response);
    }

    // --- SAGA ENDPOINTS (Order Service İçin) ---

    // Stok Düşme
    // URL: POST /api/v1/products/{id}/reduce-stock?quantity=1
    @PostMapping("/reduce-stock")
    public ResponseEntity<Void> reduceStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        inventoryService.reduceStock(productId, quantity);
        return ResponseEntity.ok().build();
    }

    // Stok İade (Rollback)
    // URL: POST /api/v1/products/{id}/restore-stock?quantity=1
    @PostMapping("/restore-stock")
    public ResponseEntity<Void> restoreStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        inventoryService.restoreStock(productId, quantity);
        return ResponseEntity.ok().build();
    }
}
