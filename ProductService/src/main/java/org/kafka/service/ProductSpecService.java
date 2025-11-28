package org.kafka.service;

import org.kafka.dto.SpecsUpdateRequestDto;
import org.kafka.dto.ProductDetailResponseDto;
import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.code.ProductErrorCode;
import org.kafka.mapper.ProductMapper;
import org.kafka.model.Product;
import org.kafka.model.ProductSpec;
import org.kafka.repository.ProductRepository;
import org.kafka.repository.ProductSpecRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductSpecService {

    private final ProductRepository productRepository;
    private final ProductSpecRepository specRepository;
    private final ProductMapper productMapper;

    /**
     * Belirtilen ürüne ait JSONB spesifikasyon verisini günceller.
     * Bu genellikle tam bir değiştirme işlemidir (replace).
     */
    @Transactional
    public ProductDetailResponseDto updateSpecs(Long productId, SpecsUpdateRequestDto request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        // Spec kaydını Product'tan alıyoruz
        ProductSpec spec = product.getSpecs();

        if (spec == null) {
            throw new BaseDomainException(ProductErrorCode.SPECS_NOT_FOUND);
        }

        // Yeni JSON String'i set etme
        spec.setSpecsData(request.getSpecsData());

        specRepository.save(spec);

        // Güncel Product detaylarını döndür
        return productMapper.toDetailResponse(product);
    }
}
