package org.kafka.controller;

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

    // --- 1. Ürün Oluşturma (CREATE) ---
    // Resim dosyası içerdiği için Content-Type: multipart/form-data olmalıdır.
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDetailResponseDto> createProduct(
            // JSON gövdesini temsil eder
            @RequestPart("data") @Valid ProductCreateRequestDto request,
            // Dosya yüklemelerini temsil eder
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        ProductDetailResponseDto response = productService.createProduct(request, images);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // --- 2. Ürün Güncelleme (UPDATE) ---
    // Sadece metinsel verileri günceller. Resim yönetimi ayrı endpointler ile yapılmalıdır.
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDetailResponseDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequestDto request) {

        ProductDetailResponseDto response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    // --- 3. Tüm Ürünleri Listeleme (READ) ---
    @GetMapping
    public ResponseEntity<List<ProductDetailResponseDto>> getAllProducts() {
        // Public erişim: Tüm kullanıcılar görebilir.
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // --- 4. ID ile Ürün Getirme (READ) ---
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponseDto> getProductById(@PathVariable Long id) {
        // Public erişim: Tüm kullanıcılar görebilir.
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // --- 5. Slug ile Ürün Getirme (READ) ---
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductDetailResponseDto> getProductBySlug(@PathVariable String slug) {
        // Public erişim: Tüm kullanıcılar görebilir.
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    // --- 6. Ürün Silme (DELETE) ---
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        // S3'teki resimler ve ilişkili tüm kayıtlar (Inventory, Spec, Image) servis katmanında silinir.
        return ResponseEntity.noContent().build();
    }

    // NOT: Resim ekleme/silme/güncelleme işlemleri için ek endpointler yazılabilir, örneğin:
    // @PostMapping("/{id}/images") -> Yeni resim ekleme
    // @DeleteMapping("/images/{imageId}") -> Belirli bir resmi silme
}




//@RestController
//@RequestMapping("/api/products")
//public class ProductController {
//
//    @GetMapping("/admin-only")
//    @PreAuthorize("hasRole('superuser')") // Sadece superuser girebilir
//    public String getAdminProduct() {
//        return "Bu alanı sadece Superuser görebilir.";
//    }
//
//    @GetMapping("/all")
//    @PreAuthorize("hasAnyRole('superuser', 'user')")
//    public String getPublicProduct() {
//        return "Bunu tüm üyeler görebilir.";
//    }
//}

