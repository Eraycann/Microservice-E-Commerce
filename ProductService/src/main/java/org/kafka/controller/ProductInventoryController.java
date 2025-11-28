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

    // ADMIN: Stok Güncelleme endpoint'i. Sadece yetkili kullanıcılar (örn: DEPOCU, ADMIN) yapabilir.
    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<ProductDetailResponseDto> updateProductStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequestDto request) {

        ProductDetailResponseDto response = inventoryService.updateStock(productId, request);
        return ResponseEntity.ok(response);
    }
}
