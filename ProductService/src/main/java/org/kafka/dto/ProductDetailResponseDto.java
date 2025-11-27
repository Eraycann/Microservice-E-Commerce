package org.kafka.dto;


import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductDetailResponseDto {
    private Long id;
    private String slug;
    private String name;
    private String description;
    private BigDecimal price;

    // İlişkili Alanlar (Mapper'da Category/Brand Entity'lerinden isimler çekilir)
    private String categoryName;
    private String brandName;

    // ProductInventory Verisi (ProductInventory Entity'sinden çekilir)
    private Integer stockCount;

    // ProductSpec Verisi (ProductSpec Entity'sinden çekilir)
    private String specsData;
}
