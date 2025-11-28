package org.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInteractionEvent implements Serializable {
    private String userId;
    private String productId;
    private String eventType;   // "VIEW", "ADD_TO_CART", "PURCHASE"
    private long timestamp;
}