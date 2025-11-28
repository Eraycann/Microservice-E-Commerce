package org.kafka.mapper;

import org.kafka.dto.ProductCreateRequestDto;
import org.kafka.dto.ProductDetailResponseDto;
import org.kafka.dto.ProductImageResponseDto;
import org.kafka.dto.ProductUpdateRequestDto;
import org.kafka.model.Product;
import org.kafka.model.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    // --- CREATE ---
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "inventory", ignore = true)
    @Mapping(target = "specs", ignore = true)
    @Mapping(target = "images", ignore = true) // Resimler create sırasında manuel işlenir
    @Mapping(target = "createdByUserId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Product toEntity(ProductCreateRequestDto dto);

    // --- READ (RESPONSE) ---
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "brand.name", target = "brandName")
    @Mapping(source = "inventory.stockCount", target = "stockCount")
    @Mapping(source = "specs.specsData", target = "specsData")
    // MapStruct, "images" alanını otomatik eşleştirir ancak alt metodun varlığını görmek ister.
    ProductDetailResponseDto toDetailResponse(Product product);

    List<ProductDetailResponseDto> toDetailResponseList(List<Product> products);

    // --- YENİ EKLENEN METOT ---
    // Tek bir ProductImage -> ProductImageResponseDto dönüşümü.
    // MapStruct bunu kullanarak List dönüşümünü otomatik halleder.
    ProductImageResponseDto toImageDto(ProductImage productImage);


    // --- UPDATE ---
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "inventory", ignore = true)
    @Mapping(target = "specs", ignore = true)
    @Mapping(target = "images", ignore = true) // Resim güncellemesi ayrı yönetilir
    @Mapping(target = "createdByUserId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntity(@MappingTarget Product product, ProductUpdateRequestDto dto);
}