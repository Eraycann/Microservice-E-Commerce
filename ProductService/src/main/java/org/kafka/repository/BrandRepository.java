package org.kafka.repository;

import org.kafka.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    /**
     * Markayı benzersiz 'slug' alanı ile bulur.
     */
    Optional<Brand> findBySlug(String slug);

    /**
     * Verilen bir slug'ın zaten kullanımda olup olmadığını kontrol eder.
     */
    boolean existsBySlug(String slug);
}
