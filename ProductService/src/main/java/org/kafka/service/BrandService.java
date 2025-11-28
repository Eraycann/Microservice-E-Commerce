package org.kafka.service;

import org.kafka.dto.BrandRequestDto;
import org.kafka.dto.BrandResponseDto;
import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.code.ProductErrorCode;
import org.kafka.mapper.MasterDataMapper;
import org.kafka.model.Brand;
import org.kafka.repository.BrandRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final MasterDataMapper masterDataMapper;
    private final DomainHelper helper;
    private final ProductQueryClient productQueryClient; // Silme kontrolü için

    @Transactional
    public BrandResponseDto createBrand(BrandRequestDto request) {
        // 1. Slug Oluşturma ve Benzersizlik Kontrolü
        String slug = helper.generateSlug(request.getName());
        if (brandRepository.existsBySlug(slug)) {
            throw new BaseDomainException(ProductErrorCode.BRAND_SLUG_ALREADY_EXISTS);
        }

        // 2. Mapping ve Temel Entity Oluşturma
        Brand brand = masterDataMapper.toBrandEntity(request);
        brand.setSlug(slug);

        Brand savedBrand = brandRepository.save(brand);
        return masterDataMapper.toBrandResponse(savedBrand);
    }

    @Transactional
    public BrandResponseDto updateBrand(Long id, BrandRequestDto request) {
        Brand existingBrand = brandRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.BRAND_NOT_FOUND));

        // 1. Slug Kontrolü (İsim değiştiyse yeni slug kontrol edilir)
        String newSlug = helper.generateSlug(request.getName());
        if (!existingBrand.getName().equals(request.getName())) {
            if (brandRepository.findBySlug(newSlug).isPresent() &&
                    !brandRepository.findBySlug(newSlug).get().getId().equals(id)) {
                throw new BaseDomainException(ProductErrorCode.BRAND_SLUG_ALREADY_EXISTS);
            }
            existingBrand.setSlug(newSlug);
        }

        // 2. Mapping ve Temel Güncelleme
        masterDataMapper.updateBrandEntity(existingBrand, request);

        return masterDataMapper.toBrandResponse(brandRepository.save(existingBrand));
    }

    @Transactional(readOnly = true)
    public BrandResponseDto getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.BRAND_NOT_FOUND));
        return masterDataMapper.toBrandResponse(brand);
    }

    @Transactional(readOnly = true)
    public List<BrandResponseDto> getAllBrands() {
        return masterDataMapper.toBrandResponseList(brandRepository.findAll());
    }

    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.BRAND_NOT_FOUND));

        // İŞ KURALI: Markaya bağlı aktif ürün var mı? (ProductQueryClient ile kontrol)
        if (productQueryClient.countActiveProductsByBrandId(id) > 0) {
            throw new BaseDomainException(ProductErrorCode.BRAND_HAS_ACTIVE_PRODUCTS);
        }

        brandRepository.delete(brand);
    }
}
