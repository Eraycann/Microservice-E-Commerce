package org.kafka.orderService.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInteractionEvent implements Serializable {
    private String userId;      // Keycloak ID (sub)
    private String productId;   // Ürün ID
    private String eventType;   // "PURCHASE"
    private long timestamp;     // Olay zamanı
}