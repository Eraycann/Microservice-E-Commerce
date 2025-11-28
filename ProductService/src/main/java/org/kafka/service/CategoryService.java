package org.kafka.service;

import org.kafka.dto.CategoryRequestDto;
import org.kafka.dto.CategoryResponseDto;
import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.code.ProductErrorCode;
import org.kafka.mapper.MasterDataMapper;
import org.kafka.model.Category;
import org.kafka.repository.CategoryRepository;

import org.kafka.service.client.ProductQueryClient;
import org.kafka.service.helper.DomainHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MasterDataMapper masterDataMapper;
    private final DomainHelper helper;
    private final ProductQueryClient productQueryClient;

    @Transactional
    public CategoryResponseDto createCategory(CategoryRequestDto request) {
        String slug = helper.generateSlug(request.getName());
        if (categoryRepository.existsBySlug(slug)) {
            throw new BaseDomainException(ProductErrorCode.CATEGORY_SLUG_ALREADY_EXISTS);
        }

        Category category = masterDataMapper.toCategoryEntity(request);
        category.setSlug(slug);

        // İlişki Kurulumu (Parent)
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PARENT_CATEGORY_NOT_FOUND));
            category.setParent(parent);
        }

        Category savedCategory = categoryRepository.save(category);
        return masterDataMapper.toCategoryResponse(savedCategory);
    }

    @Transactional
    public CategoryResponseDto updateCategory(Long id, CategoryRequestDto request) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.CATEGORY_NOT_FOUND));

        String newSlug = helper.generateSlug(request.getName());
        if (!existingCategory.getName().equals(request.getName())) {
            if (categoryRepository.findBySlug(newSlug).isPresent() &&
                    !categoryRepository.findBySlug(newSlug).get().getId().equals(id)) {
                throw new BaseDomainException(ProductErrorCode.CATEGORY_SLUG_ALREADY_EXISTS);
            }
            existingCategory.setSlug(newSlug);
        }

        masterDataMapper.updateCategoryEntity(existingCategory, request);

        //İlişki Kurulumu (Parent)
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new BaseDomainException(ProductErrorCode.CATEGORY_CANNOT_BE_ITS_OWN_PARENT);
            }
            Category newParent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PARENT_CATEGORY_NOT_FOUND));
            existingCategory.setParent(newParent);
        } else {
            existingCategory.setParent(null); // Parent ID null ise, ana kategoriye yükseltilir.
        }

        return masterDataMapper.toCategoryResponse(categoryRepository.save(existingCategory));
    }

    @Transactional(readOnly = true)
    public CategoryResponseDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.CATEGORY_NOT_FOUND));
        return masterDataMapper.toCategoryResponse(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponseDto> getAllCategories() {
        return masterDataMapper.toCategoryResponseList(categoryRepository.findAll());
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.CATEGORY_NOT_FOUND));

        // İŞ KURALI 1: Kategoriye bağlı aktif ürün var mı? (ProductQueryClient ile kontrol)
        if (productQueryClient.countActiveProductsByCategoryId(id) > 0) {
            throw new BaseDomainException(ProductErrorCode.CATEGORY_HAS_ACTIVE_PRODUCTS);
        }

        // İŞ KURALI 2: Alt kategorileri var mı?
        if (!categoryRepository.findByParentId(id).isEmpty()) {
            throw new BaseDomainException(ProductErrorCode.CATEGORY_HAS_CHILDREN);
        }

        categoryRepository.delete(category);
    }
}
