package org.kafka.service.client;

import org.kafka.service.ProductService; // Gerçek ProductService'e delegasyon yapar
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * Category ve Brand servisleri için ürün domaini hakkında sorgu yapma arayüzü.
 * Bu, ProductService'e doğrudan erişimi engelleyerek mikroservis sınırlarını korur.
 */
@Component
@RequiredArgsConstructor
public class ProductQueryClient {

    // Gerçek ProductService enjekte edilir, ancak dışarıya sadece sorgu yetkisi verilir.
    private final ProductService productService;

    /**
     * Belirtilen kategori ID'sine bağlı aktif ürün sayısını getirir.
     */
    public long countActiveProductsByCategoryId(Long categoryId) {
        // ProductService'in ilgili metoduna delegasyon yapılır.
        return productService.countByCategoryId(categoryId);
    }

    /**
     * Belirtilen marka ID'sine bağlı aktif ürün sayısını getirir.
     */
    public long countActiveProductsByBrandId(Long brandId) {
        // ProductService'in ilgili metoduna delegasyon yapılır.
        return productService.countByBrandId(brandId);
    }
}
