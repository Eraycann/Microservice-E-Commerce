package org.kafka.repository;

import org.kafka.dto.SearchRequest;
import org.kafka.model.ProductIndex;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface CustomSearchRepository {

    /**
     * Temel filtreleme metodu (pagination ile)
     */
    Page<ProductIndex> searchByFilters(
            String query, 
            String brand, 
            String category,
            BigDecimal minPrice, 
            BigDecimal maxPrice, 
            Map<String, String> searchSpecs,
            Pageable pageable
    );

    /**
     * Autocomplete önerileri
     */
    List<String> autoSuggestProductNames(String input);

    /**
     * Satış sayısını atomik olarak artır
     */
    void incrementSalesCount(String productId, int quantity);

    /**
     * Çok satan ürünleri getir (pagination ile)
     */
    Page<ProductIndex> findBestSellers(Pageable pageable);

    /**
     * Vitrin ürünlerini getir (pagination ile)
     */
    Page<ProductIndex> findFeaturedProducts(Pageable pageable);

    /**
     * En çok satan markaları getir (aggregation)
     */
    List<String> findTopBrands(int limit);

    /**
     * Gelişmiş arama (kompleks sorgular için)
     */
    Page<ProductIndex> advancedSearch(SearchRequest request, Pageable pageable);
}