package org.kafka.controller;

import org.kafka.dto.CategoryRequestDto;
import org.kafka.dto.CategoryResponseDto;
import org.kafka.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // ADMIN: Yeni Kategori Oluşturma
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponseDto> createCategory(@Valid @RequestBody CategoryRequestDto request) {
        CategoryResponseDto response = categoryService.createCategory(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ADMIN: Kategori Güncelleme
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponseDto> updateCategory(@PathVariable Long id,
                                                              @Valid @RequestBody CategoryRequestDto request) {
        CategoryResponseDto response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(response);
    }

    // PUBLIC/USER: Tüm Kategorileri Listeleme (Okuma izni tüm kullanıcılara açıktır)
    @GetMapping
    public ResponseEntity<List<CategoryResponseDto>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // PUBLIC/USER: ID ile Kategori Getirme (Okuma izni tüm kullanıcılara açıktır)
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDto> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    // ADMIN: Kategori Silme
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
