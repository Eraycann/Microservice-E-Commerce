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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<ProductDetailResponseDto> createProduct(
            // JSON gövdesini temsil eder
            @RequestPart("data") @Valid ProductCreateRequestDto request,
            // Dosya yüklemelerini temsil eder
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        ProductDetailResponseDto response = productService.createProduct(request, images);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<ProductDetailResponseDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequestDto request) {

        ProductDetailResponseDto response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/cart-detail")
    public ResponseEntity<ProductCartDetailDto> getProductForCart(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductForCart(id));
    }

    // URL: PATCH /api/v1/products/{id}/featured?featured=true
    @PatchMapping("/{id}/featured")
    @PreAuthorize("hasRole('superuser')") // Sadece admin yapabilir
    public ResponseEntity<ProductDetailResponseDto> updateFeaturedStatus(
            @PathVariable Long id,
            @RequestParam boolean featured) {

        return ResponseEntity.ok(productService.updateFeaturedStatus(id, featured));
    }
}

