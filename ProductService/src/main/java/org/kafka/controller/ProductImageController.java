package org.kafka.controller;


import org.kafka.dto.ProductImageOrderUpdateDto;
import org.kafka.dto.ProductImageResponseDto;
import org.kafka.service.ProductImageService;
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
@RequestMapping("/api/v1/products/{productId}/images")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductImageService imageService;

    // Belirli bir ürüne yeni bir resim dosyası ekler.
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<ProductImageResponseDto> addImage(
            @PathVariable Long productId,
            @RequestPart("image") MultipartFile imageFile) {

        ProductImageResponseDto response = imageService.addImageToProduct(productId, imageFile);
        return new ResponseEntity<>(response, HttpStatus.CREATED); // 201 Created
    }

    // Resim ID'si ile resmi hem S3'ten hem DB'den siler.
    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<Void> deleteImage(@PathVariable Long productId, @PathVariable Long imageId) {
        // productId sadece URL yapısı için konulmuştur, silme işlemi imageId üzerinden yapılır.
        imageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }

    // Birden fazla resmin sırasını ve ana resim (isMain) bayrağını günceller.
    @PutMapping("/order")
    @PreAuthorize("hasRole('superuser')")
    public ResponseEntity<Void> updateImageOrderAndMainFlag(
            @PathVariable Long productId,
            @Valid @RequestBody List<ProductImageOrderUpdateDto> updates) {

        imageService.updateImageOrderAndMainFlag(productId, updates);
        return ResponseEntity.ok().build(); // 200 OK
    }
}
