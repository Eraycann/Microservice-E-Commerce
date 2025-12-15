package org.kafka.repository;

import org.kafka.model.ProductIndex;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.math.BigDecimal;
import java.util.List;

public interface ProductSearchRepository extends ElasticsearchRepository<ProductIndex, String>, CustomSearchRepository {
    // İsim veya Açıklama içinde arama (Fuzzy Search gibi davranır)
    List<ProductIndex> findByNameContainingOrDescriptionContaining(String name, String description);

    // Kategoriye göre filtrele
    List<ProductIndex> findByCategory(String category);

    // Markaya göre filtrele
    List<ProductIndex> findByBrand(String brand);

    // Fiyat aralığı
    List<ProductIndex> findByPriceBetween(BigDecimal min, BigDecimal max);
}