package org.kafka.repository;

import org.kafka.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Ürünü, SEO dostu ve benzersiz olan 'slug' alanı ile bulur.
     * Bu, GET /api/v1/products/{slug} endpoint'i için ana okuma metodudur.
     */
    Optional<Product> findBySlug(String slug);

    /**
     * Verilen bir slug'ın zaten kullanımda olup olmadığını kontrol eder.
     * Ürün oluşturma (create) sırasında çakışmayı kontrol etmek için kullanılır.
     */
    boolean existsBySlug(String slug);

    /**
     * Verilen kategori ID'sine sahip kaç tane aktif ürün olduğunu sayar.
     * Category silinmeden önce kontrol etmek için kullanılabilir.
     */
    long countByCategoryId(Long categoryId);

    /**
     * Verilen marka ID'sine sahip kaç tane aktif ürün olduğunu sayar.
     * Brand silinmeden önce kontrol etmek için kullanılabilir.
     */
    long countByBrandId(Long brandId);
}
