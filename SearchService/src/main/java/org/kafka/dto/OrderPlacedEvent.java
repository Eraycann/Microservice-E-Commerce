package org.kafka.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
public class OrderPlacedEvent {
    // Sadece bize lazım olan (productId, quantity) alanları alsak yeter ama
    // JSON mapping hatası olmasın diye diğerlerini de ekleyebilirsin veya
    // @JsonIgnoreProperties(ignoreUnknown = true) kullanabilirsin.

    private String orderNumber;
    private List<OrderItemEvent> items;

    @Data
    @NoArgsConstructor
    public static class OrderItemEvent {
        private String productId;
        private Integer quantity;
    }
}