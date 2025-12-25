package org.kafka.cartService.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserMergeEvent implements Serializable {
    private String guestId; // Örn: "550e8400-e29b..."
    private String userId;  // Örn: "keycloak-user-123"
    private long timestamp;
}