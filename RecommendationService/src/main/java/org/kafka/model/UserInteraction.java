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

    @Indexed // Sorgularda hızlanmak için index
    private String userId;

    @Indexed
    private String productId;

    private String eventType; // VIEW, PURCHASE, etc.

    private Instant createdAt; // Analiz için zaman damgası
}