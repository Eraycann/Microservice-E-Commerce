package org.kafka.controller;

import org.kafka.dto.ProductCartDetailDto;
import org.kafka.dto.ProductCreateRequestDto;
import org.kafka.dto.ProductDetailResponseDto;
import org.kafka.dto.ProductUpdateRequestDto;
import org.kafka.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // --- ADMIN İŞLEMLERİ (Kilitli) ---

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<ProductDetailResponseDto> createProduct(
            @RequestPart("data") @Valid ProductCreateRequestDto request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return new ResponseEntity<>(productService.createProduct(request, images), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<ProductDetailResponseDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequestDto request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/featured")
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<ProductDetailResponseDto> updateFeaturedStatus(
            @PathVariable Long id,
            @RequestParam boolean featured) {
        return ResponseEntity.ok(productService.updateFeaturedStatus(id, featured));
    }

    // --- HALKA AÇIK İŞLEMLER (Public) ---
    // SecurityConfig'de .permitAll() yapıldığı için burada token sormaz.

    @GetMapping
    public ResponseEntity<List<ProductDetailResponseDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponseDto> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductDetailResponseDto> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    @GetMapping("/{id}/cart-detail")
    public ResponseEntity<ProductCartDetailDto> getProductForCart(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductForCart(id));
    }
}