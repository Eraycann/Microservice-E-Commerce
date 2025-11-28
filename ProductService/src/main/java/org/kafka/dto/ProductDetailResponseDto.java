package org.kafka.dto;


import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ProductDetailResponseDto {
    private Long id;
    private String slug;
    private String name;
    private String description;
    private BigDecimal price;

    private String categoryName;
    private String brandName;
    private Integer stockCount;
    private String specsData;

    // --- DEĞİŞİKLİK ---
    // Artık sadece String listesi değil, detaylı resim objesi listesi dönüyoruz.
    private List<ProductImageResponseDto> images;
}
