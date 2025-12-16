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
    private final SearchEventPublisher searchEventPublisher; // <-- EKLENDİ

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

        // ... Stok hesaplama işlemleri ...
        inventory.setStockCount(newStock);
        inventory.setLastUpdated(LocalDateTime.now());

        inventoryRepository.save(inventory);

        // --- YENİ EKLENEN KISIM ---
        // Stok değişti, Elasticsearch'ü güncelle!
        searchEventPublisher.sendProductEvent(product, "UPDATE");
        // ---------------------------

        return productMapper.toDetailResponse(product);
    }

    /**
     * SAGA: Order Service tarafından çağrılır.
     * Stoğu güvenli ve atomik bir şekilde düşürür.
     */
    @Transactional
    public void reduceStock(Long productId, Integer quantity) {
        // 1. Ürün var mı kontrolü
        if (!productRepository.existsById(productId)) {
            throw new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND);
        }

        // 2. Atomik güncelleme (DB seviyesinde)
        int updatedRows = inventoryRepository.reduceStock(productId, quantity);

        // 3. Yetersiz stok kontrolü
        if (updatedRows == 0) {
            throw new BaseDomainException(ProductErrorCode.INSUFFICIENT_STOCK);
        }

        // 4. 🚀 EVENT: Stok düştü, Elasticsearch güncellenmeli!
        // Not: reduceStock native query olduğu için entity context güncellenmemiş olabilir.
        // En güncel veriyi (yeni stoğu) çekip gönderiyoruz.
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        searchEventPublisher.sendProductEvent(product, "UPDATE");
    }

    /**
     * SAGA ROLLBACK: Sipariş iptal olursa stok iade edilir.
     */
    @Transactional
    public void restoreStock(Long productId, Integer quantity) {
        if (!productRepository.existsById(productId)) {
            throw new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND);
        }

        // 1. Stoğu iade et
        inventoryRepository.restoreStock(productId, quantity);

        // 2. 🚀 EVENT: Stok arttı (iade), Elasticsearch güncellenmeli!
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        searchEventPublisher.sendProductEvent(product, "UPDATE");
    }
}
