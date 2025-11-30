package org.kafka.cartService.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInteractionEvent implements Serializable {
    private String userId;      // Keycloak ID
    private String productId;   // Ürün ID (String olması daha güvenli ama Long geliyorsa String'e çeviririz)
    private String eventType;   // "VIEW", "ADD_TO_CART", "PURCHASE"
    private long timestamp;     // Olay zamanı (Epoch ms)
}