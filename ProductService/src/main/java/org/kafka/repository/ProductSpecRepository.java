package org.kafka.repository;

import org.kafka.model.ProductSpec;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductSpecRepository extends JpaRepository<ProductSpec, Long> {
    /**
     * Verilen Product ID'sine ait teknik özellik kaydını bulur.
     */
    Optional<ProductSpec> findByProductId(Long productId);
}
