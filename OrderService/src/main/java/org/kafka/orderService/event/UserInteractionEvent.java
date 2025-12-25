package org.kafka.orderService.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInteractionEvent implements Serializable {
    private String userId;      // Keycloak ID (Login olduysa dolu, yoksa null)
    private String guestId;     // Ziyaretçi UUID (Her zaman dolu olabilir) [YENİ]
    private String productId;
    private String eventType;   // "VIEW", "ADD_TO_CART", "PURCHASE"
    private long timestamp;
}