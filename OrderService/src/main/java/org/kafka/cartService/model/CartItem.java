package org.kafka.cartService.model;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    private Long productId;
    private String productName;
    private String productSlug;
    private String imageUrl;

    private Integer quantity;
    private BigDecimal price; // Price Snapshot (O anki fiyat)

    // Satır toplamı (quantity * price)
    private BigDecimal totalItemPrice;
}
