package org.kafka.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // --- ADMIN İŞLEMLERİ (Kilitli) ---

    // Basit ürün oluşturma (JSON) - MVP için
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<ProductDetailResponseDto> createProductSimple(
            @Valid @RequestBody ProductCreateRequestDto request) {
        return new ResponseEntity<>(productService.createProduct(request, null), HttpStatus.CREATED);
    }

    // Resimli ürün oluşturma (Multipart) - Gelişmiş özellik
    @PostMapping(value = "/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<ProductDetailResponseDto> createProductWithImages(
            @RequestParam("data") String requestData,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        
        try {
            // JSON string'i ProductCreateRequestDto'ya parse et
            ObjectMapper objectMapper = new ObjectMapper();
            ProductCreateRequestDto request = objectMapper.readValue(requestData, ProductCreateRequestDto.class);
            
            return new ResponseEntity<>(productService.createProduct(request, images), HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException("Invalid JSON data format", e);
        }
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

    // 👇 EKLENEN KISIM: Recommendation Service'in kullandığı toplu ürün çekme endpoint'i
    @GetMapping("/ids")
    public ResponseEntity<List<ProductDetailResponseDto>> getProductsByIds(@RequestParam List<String> ids) {
        return ResponseEntity.ok(productService.findAllByIds(ids));
    }
    @GetMapping("/featured")
    public ResponseEntity<List<ProductDetailResponseDto>> getFeaturedProducts(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(productService.getFeaturedProducts(limit));
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

    @GetMapping("/{id}/cart-detail")
    public ResponseEntity<ProductCartDetailDto> getProductForCart(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductForCart(id));
    }

    // --- ADMIN STATS ENDPOİNTLERİ ---
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<Object> getProductStats() {
        try {
            long totalProducts = productService.getTotalProductCount();
            long lowStockProducts = productService.getLowStockProductCount();
            
            return ResponseEntity.ok(Map.of(
                "total", totalProducts,
                "lowStock", lowStockProducts
            ));
        } catch (Exception e) {
            // Fallback değerleri döndür
            return ResponseEntity.ok(Map.of(
                "total", 0,
                "lowStock", 0
            ));
        }
    }
}