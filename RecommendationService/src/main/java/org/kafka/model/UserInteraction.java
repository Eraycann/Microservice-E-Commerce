package org.kafka.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_interactions")
public class UserInteraction {

    @Id
    private String id;

    @Indexed
    private String userId;  // Login ise dolu, değilse null

    @Indexed
    private String guestId; // Misafir ise dolu (YENİ EKLENDİ)

    @Indexed
    private String productId;

    private String eventType; // VIEW, ADD_TO_CART, PURCHASE

    private Instant createdAt;
}