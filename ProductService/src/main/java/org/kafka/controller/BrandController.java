package org.kafka.controller;

import org.kafka.dto.BrandRequestDto;
import org.kafka.dto.BrandResponseDto;
import org.kafka.service.BrandService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    // ADMIN: Yeni Marka Oluşturma
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandResponseDto> createBrand(@Valid @RequestBody BrandRequestDto request) {
        BrandResponseDto response = brandService.createBrand(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ADMIN: Marka Güncelleme
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandResponseDto> updateBrand(@PathVariable Long id,
                                                        @Valid @RequestBody BrandRequestDto request) {
        BrandResponseDto response = brandService.updateBrand(id, request);
        return ResponseEntity.ok(response);
    }

    // PUBLIC/USER: Tüm Markaları Listeleme (Okuma izni tüm kullanıcılara açıktır)
    @GetMapping
    public ResponseEntity<List<BrandResponseDto>> getAllBrands() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    // PUBLIC/USER: ID ile Marka Getirme (Okuma izni tüm kullanıcılara açıktır)
    @GetMapping("/{id}")
    public ResponseEntity<BrandResponseDto> getBrandById(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.getBrandById(id));
    }

    // ADMIN: Marka Silme
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}
