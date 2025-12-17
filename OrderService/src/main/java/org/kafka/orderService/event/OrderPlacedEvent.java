package org.kafka.orderService.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderPlacedEvent implements Serializable {
    private String orderNumber;
    private String userId;

    // JWT'den dolduracağımız alanlar:
    private String userEmail;     // "admin@example.com"
    private String userFullName;  // "ADMİN ADMİN" (given_name + family_name)

    private BigDecimal totalPrice;

    // --- YENİ EKLENEN: Satılan Ürünlerin Listesi ---
    private List<OrderItemEvent> items;
}