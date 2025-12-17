package org.kafka.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.model.ProductIndex;
import org.kafka.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    // 1. Basit Arama Kutusu (Header Search Bar)
    @GetMapping
    public ResponseEntity<List<ProductIndex>> searchProducts(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(searchService.search(query));
    }

    // 2. Detaylı Filtreleme Sayfası (Category Page / Search Results Page)
    @GetMapping("/filter")
    public ResponseEntity<List<ProductIndex>> filterProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String brand,    // EKLENDİ
            @RequestParam(required = false) String category, // EKLENDİ
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam Map<String, String> allParams
    ) {
        // "spec_" ile başlayan parametreleri ayıklıyoruz.
        Map<String, String> specs = allParams.entrySet().stream()
                .filter(e -> e.getKey().startsWith("spec_"))
                .collect(Collectors.toMap(
                        k -> k.getKey().replace("spec_", ""),
                        Map.Entry::getValue
                ));

        return ResponseEntity.ok(searchService.filterProducts(query, brand, category, minPrice, maxPrice, specs));
    }

    // --- YENİ ENDPOINT: ÖNERİ SİSTEMİ ---
    // URL: GET /api/v1/search/suggestions?input=lap
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam String input) {
        return ResponseEntity.ok(searchService.autoSuggest(input));
    }

    // GET /api/v1/search/featured -> Vitrin Ürünleri
    @GetMapping("/featured")
    public ResponseEntity<List<ProductIndex>> getFeaturedProducts() {
        return ResponseEntity.ok(searchService.getFeaturedProducts());
    }

    // GET /api/v1/search/bestsellers -> Çok Satanlar
    @GetMapping("/bestsellers")
    public ResponseEntity<List<ProductIndex>> getBestSellers() {
        return ResponseEntity.ok(searchService.getBestSellers());
    }

    // GET /api/v1/search/top-brands -> En Popüler Markalar
    @GetMapping("/top-brands")
    public ResponseEntity<List<String>> getTopBrands() {
        return ResponseEntity.ok(searchService.getTopBrands());
    }
}