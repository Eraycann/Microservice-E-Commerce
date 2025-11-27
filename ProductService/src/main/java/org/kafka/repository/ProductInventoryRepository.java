package org.kafka.repository;

import org.kafka.model.ProductInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductInventoryRepository extends JpaRepository<ProductInventory, Long> {

    /**
     * Verilen Product ID'sine ait envanter kaydını bulur.
     * Stok güncelleme işlemleri için kritiktir.
     */
    Optional<ProductInventory> findByProductId(Long productId);

    /**
     * Stok miktarını doğrudan veritabanında atomik olarak güncellemek için kullanılabilir.
     * Bu, yüksek konkurent ortamlarda `SELECT` ve ardından `UPDATE` yapmaktan daha güvenli olabilir.
     * Ancak, burada Spring Data JPA'nın otomatik metotlarına bağlı kalmak yerine
     * @Query ile özel JPQL (veya Native SQL) yazmak gerekebilir (Şimdilik JpaRepository kullandık).
     */
}
