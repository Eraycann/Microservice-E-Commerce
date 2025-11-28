package org.kafka.service;

import org.kafka.dto.StockUpdateRequestDto;
import org.kafka.dto.ProductDetailResponseDto; // Güncel detayları döndürmek için
import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.code.ProductErrorCode;
import org.kafka.mapper.ProductMapper;
import org.kafka.model.Product;
import org.kafka.model.ProductInventory;
import org.kafka.repository.ProductInventoryRepository;
import org.kafka.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductInventoryService {

    private final ProductRepository productRepository;
    private final ProductInventoryRepository inventoryRepository;
    private final ProductMapper productMapper;

    /**
     * Belirtilen ürüne ait stoğu verilen delta kadar günceller.
     * Stok, negatif olmamalıdır (iş kuralı).
     */
    @Transactional
    public ProductDetailResponseDto updateStock(Long productId, StockUpdateRequestDto request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        // Inventory kaydını Product'tan alıyoruz (mappedBy ilişkisi ile)
        ProductInventory inventory = product.getInventory();

        if (inventory == null) {
            // Normalde CascadeType.ALL sayesinde bu olmaz, ancak sağlamlık için kontrol şart.
            throw new BaseDomainException(ProductErrorCode.INVENTORY_NOT_FOUND);
        }

        Integer delta = request.getQuantityDelta();
        Integer currentStock = inventory.getStockCount();
        Integer newStock = currentStock + delta;

        // İş Kuralı: Stok negatif olamaz.
        if (newStock < 0) {
            throw new BaseDomainException(ProductErrorCode.STOCK_CANNOT_BE_NEGATIVE);
        }

        // Güncelleme
        inventory.setStockCount(newStock);
        inventory.setLastUpdated(LocalDateTime.now());

        // Inventory entity'si Product'a bağlı olduğu için, productRepository.save(product) çağrılabilir.
        // Ancak InventoryRepository'yi kullanmak da transaction kapsamında geçerlidir.
        inventoryRepository.save(inventory);

        // Güncel Product detaylarını döndür
        return productMapper.toDetailResponse(product);
    }
}
