package org.kafka.repository;

import org.kafka.model.ProductIndex;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.math.BigDecimal;
import java.util.List;

public interface ProductSearchRepository extends ElasticsearchRepository<ProductIndex, String>, CustomSearchRepository {
    
    /**
     * İsim veya açıklama içinde arama (basit Spring Data metodu)
     */
    List<ProductIndex> findByNameContainingOrDescriptionContaining(String name, String description);

    /**
     * Kategoriye göre filtrele
     */
    Page<ProductIndex> findByCategory(String category, Pageable pageable);

    /**
     * Markaya göre filtrele
     */
    Page<ProductIndex> findByBrand(String brand, Pageable pageable);

    /**
     * Fiyat aralığı
     */
    Page<ProductIndex> findByPriceBetween(BigDecimal min, BigDecimal max, Pageable pageable);

    /**
     * Vitrin ürünleri (basit Spring Data metodu)
     */
    Page<ProductIndex> findByFeaturedTrueAndActiveTrue(Pageable pageable);

    /**
     * Aktif ürünler
     */
    Page<ProductIndex> findByActiveTrue(Pageable pageable);

    /**
     * Marka ve kategori kombinasyonu
     */
    Page<ProductIndex> findByBrandAndCategoryAndActiveTrue(String brand, String category, Pageable pageable);

    /**
     * Toplam aktif ürün sayısı
     */
    long countByActiveTrue();
}