package org.kafka.repository;

import org.kafka.model.ProductIndex;
import java.util.List;
import java.util.Map;

public interface CustomSearchRepository {

    // Mevcut filtreleme metodun
    List<ProductIndex> searchByFilters(
            String query, String brand, String category,
            Double minPrice, Double maxPrice, Map<String, String> searchSpecs
    );

    // Mevcut autocomplete metodun
    List<String> autoSuggestProductNames(String input);

    // --- YENİ EKLENENLER ---

    // 1. Satış sayısını atomik olarak artır (Veriyi çekmeden güncelleme)
    void incrementSalesCount(String productId, int quantity);

    // 2. Çok satan ürünleri getir
    List<ProductIndex> findBestSellers(int limit);

    // 3. En çok satan markaları getir (Aggregation)
    List<String> findTopBrands(int limit);
}