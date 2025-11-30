package org.kafka.cartService.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class ProductCartDetailDto {
    private Long id;
    private String name;
    private String slug;
    private BigDecimal price;
    private Integer stockCount;
    private String mainImageUrl; // Sepette küçük resim göstermek için
}
