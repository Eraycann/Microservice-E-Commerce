package org.kafka.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductUpdateRequestDto {
    private String name;
    private String description;
    private BigDecimal price;
    private Long categoryId;
    private Long brandId;

    // Slug'ın Servis katmanında isimden yeniden oluşturulacağı varsayılır.
}
