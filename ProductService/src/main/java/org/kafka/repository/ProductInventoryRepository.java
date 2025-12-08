package org.kafka.repository;

import org.kafka.model.ProductInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductInventoryRepository extends JpaRepository<ProductInventory, Long> {

    Optional<ProductInventory> findByProductId(Long productId);

    /**
     * SAGA: Stok Düşme İşlemi (Reduce Stock)
     * Veritabanı seviyesinde atomik işlem yapar.
     * Eğer stok yeterliyse düşer ve 1 döner. Yetersizse işlem yapmaz ve 0 döner.
     */
    @Modifying
    @Query("UPDATE ProductInventory i SET i.stockCount = i.stockCount - :quantity " +
            "WHERE i.product.id = :productId AND i.stockCount >= :quantity")
    int reduceStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);

    /**
     * SAGA: Stok İade İşlemi (Rollback/Restore Stock)
     * Sipariş iptal olursa stoğu geri artırır.
     */
    @Modifying
    @Query("UPDATE ProductInventory i SET i.stockCount = i.stockCount + :quantity " +
            "WHERE i.product.id = :productId")
    void restoreStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);
}