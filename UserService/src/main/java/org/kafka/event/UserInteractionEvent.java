package org.kafka.event;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInteractionEvent implements Serializable {
    private String userId;      // Keycloak ID
    private String productId;   // Ürün ID
    private String eventType;   // "VIEW", "ADD_TO_CART", "PURCHASE"
    private long timestamp;     // Olay zamanı (Epoch ms)
}