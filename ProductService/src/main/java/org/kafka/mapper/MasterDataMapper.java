package org.kafka.mapper;

import org.kafka.dto.BrandRequestDto;
import org.kafka.dto.BrandResponseDto;
import org.kafka.dto.CategoryRequestDto;
import org.kafka.dto.CategoryResponseDto;
import org.kafka.model.Brand;
import org.kafka.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MasterDataMapper {

    // ----------------------------------------------------------------------
    // --- Category Dönüşümleri ---
    // ----------------------------------------------------------------------

    // 1. CategoryRequestDto -> Entity (Yeni Kayıt)
    @Mapping(source = "parentId", target = "parent", ignore = true) // DTO'daki parentId'yi görmezden gel
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true) // Slug Servis'te oluşturulur
    // @Mapping(target = "parent", ignore = true) satırı kaldırıldı
    Category toCategoryEntity(CategoryRequestDto dto);

    // 2. Category Entity -> Response DTO
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", source = "parent.name")
    CategoryResponseDto toCategoryResponse(Category category);
    List<CategoryResponseDto> toCategoryResponseList(List<Category> categories);

    // 3. Update: CategoryRequestDto -> Mevcut Entity
    @Mapping(source = "parentId", target = "parent", ignore = true) // DTO'daki parentId'yi görmezden gel
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    // @Mapping(target = "parent", ignore = true) satırı kaldırıldı
    void updateCategoryEntity(@MappingTarget Category category, CategoryRequestDto dto);


    // ----------------------------------------------------------------------
    // --- Brand Dönüşümleri ---
    // ----------------------------------------------------------------------

    // 1. BrandRequestDto -> Entity (Yeni Kayıt)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true) // Slug Servis'te oluşturulur
    Brand toBrandEntity(BrandRequestDto dto);

    // 2. Brand Entity -> Response DTO
    BrandResponseDto toBrandResponse(Brand brand);
    List<BrandResponseDto> toBrandResponseList(List<Brand> brands);

    // 3. Update: BrandRequestDto -> Mevcut Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    void updateBrandEntity(@MappingTarget Brand brand, BrandRequestDto dto);
}