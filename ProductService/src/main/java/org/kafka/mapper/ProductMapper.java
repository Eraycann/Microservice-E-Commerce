package org.kafka.mapper;


import org.kafka.dto.ProductCreateRequestDto;
import org.kafka.dto.ProductDetailResponseDto;
import org.kafka.dto.ProductUpdateRequestDto;
import org.kafka.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    // ----------------------------------------------------------------------
    // --- ProductCreateRequestDto -> Product Entity (Yeni Kayıt) ---
    // ----------------------------------------------------------------------

    // MapStruct'ın Entity ID'lerini, Slug'ı, ilişkileri ve alt Entity'leri ignore etmesi gerekir.
    // Bunlar Service katmanında manuel olarak çözümlenir ve set edilir.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true) // Kategori ID'si Servis'te Entity'ye çevrilir
    @Mapping(target = "brand", ignore = true)     // Marka ID'si Servis'te Entity'ye çevrilir
    @Mapping(target = "inventory", ignore = true) // Inventory, Product Entity'si oluşturulduktan sonra başlatılır
    @Mapping(target = "specs", ignore = true)     // Specs, Product Entity'si oluşturulduktan sonra başlatılır
    @Mapping(target = "createdByUserId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)

    // Not: initialStockCount ve specsData, ProductCreateRequestDto'dan Product'a geçmez;
    // onlar Servis katmanında Inventory ve Spec Entity'lerine atanır.
    Product toEntity(ProductCreateRequestDto dto);

    // ----------------------------------------------------------------------
    // --- Product Entity -> ProductDetailResponseDto (Okuma) ---
    // ----------------------------------------------------------------------

    // İlişkisel Entity'lerden veriyi çekerek DTO'ya düzleştirme (Flattening).
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "brand.name", target = "brandName")
    @Mapping(source = "inventory.stockCount", target = "stockCount")
    @Mapping(source = "specs.specsData", target = "specsData")
    ProductDetailResponseDto toDetailResponse(Product product);

    List<ProductDetailResponseDto> toDetailResponseList(List<Product> products);

    // ----------------------------------------------------------------------
    // --- ProductUpdateRequestDto -> Product Entity (Güncelleme) ---
    // ----------------------------------------------------------------------

    // Mevcut Product Entity'sini günceller. ID, Slug ve alt Entity'ler korunur.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true) // Slug'ın değişip değişmediği Servis'te kontrol edilir
    @Mapping(target = "category", ignore = true) // İlişkiler Servis'te çözümlenir
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "inventory", ignore = true)
    @Mapping(target = "specs", ignore = true)
    @Mapping(target = "createdByUserId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntity(@MappingTarget Product product, ProductUpdateRequestDto dto);

}
