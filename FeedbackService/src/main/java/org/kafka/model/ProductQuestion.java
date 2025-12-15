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
@Document(collection = "product_questions")
public class ProductQuestion {
    @Id
    private String id;

    @Indexed
    private String productId;

    private String userId;
    private String userFullName; // Soran kişinin ismi

    private String questionText;

    // --- CEVAP KISMI (Gömülü) ---
    private String answerText;
    private String answeredBy; // Cevaplayan Admin'in ismi
    private Instant answerDate;

    @Builder.Default
    private Instant askDate = Instant.now();

    @Builder.Default
    private boolean isApproved = true; // İleride moderasyon gerekirse false başlar
}