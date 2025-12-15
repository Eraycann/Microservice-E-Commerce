package org.kafka.repository;

import org.kafka.model.ProductIndex;
import java.util.List;
import java.util.Map;

public interface CustomSearchRepository {

    List<ProductIndex> searchByFilters(
            String query,
            String brand,
            String category,
            Double minPrice,
            Double maxPrice,
            Map<String, String> searchSpecs
    );

    // --- YENİ EKLENEN ---
    // Arama çubuğunda harflere basıldığında öneri sunacak metot
    List<String> autoSuggestProductNames(String input);
}