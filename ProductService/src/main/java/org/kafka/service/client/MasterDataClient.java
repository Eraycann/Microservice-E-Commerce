package org.kafka.service.client;

import lombok.RequiredArgsConstructor;
import org.kafka.model.Brand;
import org.kafka.model.Category;
import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.code.ProductErrorCode;
import org.kafka.repository.BrandRepository;
import org.kafka.repository.CategoryRepository;
import org.springframework.stereotype.Component;

/**
 * ProductService'in, Category ve Brand domainlerine sadece "okuma/doğrulama"
 * amacıyla erişmesini sağlayan ara katman.
 */
@Component
@RequiredArgsConstructor
public class MasterDataClient {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.CATEGORY_NOT_FOUND));
    }

    public Brand getBrandById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.BRAND_NOT_FOUND));
    }
}
