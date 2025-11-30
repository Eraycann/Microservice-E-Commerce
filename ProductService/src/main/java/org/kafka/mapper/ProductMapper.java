package org.kafka.mapper;

import org.kafka.dto.*;
import org.kafka.model.Product;
import org.kafka.model.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "inventory", ignore = true)
    @Mapping(target = "specs", ignore = true)
    @Mapping(target = "images", ignore = true) // Resimler create sırasında manuel işlenir
    @Mapping(target = "createdAt", ignore = true)
    Product toEntity(ProductCreateRequestDto dto);


    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "brand.name", target = "brandName")
    @Mapping(source = "inventory.stockCount", target = "stockCount")
    @Mapping(source = "specs.specsData", target = "specsData")
    ProductDetailResponseDto toDetailResponse(Product product);

    List<ProductDetailResponseDto> toDetailResponseList(List<Product> products);

    ProductImageResponseDto toImageDto(ProductImage productImage);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "inventory", ignore = true)
    @Mapping(target = "specs", ignore = true)
    @Mapping(target = "images", ignore = true) // Resim güncellemesi ayrı yönetilir
    @Mapping(target = "createdAt", ignore = true)
    void updateEntity(@MappingTarget Product product, ProductUpdateRequestDto dto);


    @Mapping(source = "inventory.stockCount", target = "stockCount")
    @Mapping(target = "mainImageUrl", ignore = true) // Bu alan, özel mantık gerektirir
    ProductCartDetailDto toCartDetailDto(Product product);
}