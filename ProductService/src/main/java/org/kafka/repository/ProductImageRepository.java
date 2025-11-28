package org.kafka.repository;

import org.kafka.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    /**
     * Belirtilen productId'ye ait resimlerin maksimum sıra numarasını bulur.
     * Bu, yeni eklenecek resmin sırasını belirlemek için kullanılır.
     *
     * @param productId İlişkili Product'ın ID'si.
     * @return Maksimum sıra numarası (Hiç resim yoksa Optional.empty döner).
     */
    @Query("SELECT MAX(pi.displayOrder) FROM ProductImage pi WHERE pi.product.id = :productId")
    Optional<Integer> findMaxDisplayOrderByProductId(Long productId);

    /**
     * Belirtilen productId'ye ait tüm resimleri, sıra numarasına göre artan şekilde listeler.
     * Sıralama ve toplu güncelleme işlemleri için kullanılır.
     *
     * @param productId İlişkili Product'ın ID'si.
     * @return Sıraya göre dizilmiş ProductImage listesi.
     */
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Long productId);

    /**
     * Belirtilen productId'ye ait tüm resimleri listeler.
     * * @param productId İlişkili Product'ın ID'si.
     * @return ProductImage listesi.
     */
    List<ProductImage> findByProductId(Long productId);
}