package org.kafka.service;

import lombok.RequiredArgsConstructor;
import org.kafka.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    // ... (Diğer bağımlılıklar) ...

    /**
     * Internal Query Metodu: Category Service tarafından çağrılır.
     * Bu metot, Product domaininin dışına Repository'e erişim izni vermez.
     */
    @Transactional(readOnly = true)
    public long countByCategoryId(Long categoryId) {
        // Kendi Repository'mizi kullanarak sayım yapıyoruz.
        return productRepository.countByCategoryId(categoryId);
    }

    /**
     * Internal Query Metodu: Brand Service tarafından çağrılır.
     */
    @Transactional(readOnly = true)
    public long countByBrandId(Long brandId) {
        // Kendi Repository'mizi kullanarak sayım yapıyoruz.
        return productRepository.countByBrandId(brandId);
    }

    // ... (Diğer Product CRUD metotları) ...
}
