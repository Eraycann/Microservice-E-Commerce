package org.kafka.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
public class Review {
    @Id
    private String id;

    @Indexed
    private String productId;

    @Indexed
    private String userId;

    private String userFullName; // JWT "name" (Eraycan Sivri)

    private int rating;       // 1-5
    private String comment;

    // --- YENİ: FOTOĞRAFLI YORUM ---
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>(); // Resim URL'leri

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private int helpfulCount = 0; // "Faydalı" sayısı

    // Kimlerin like attığını tutmak istersen (Tekrar like atılmasın diye):
    // @Builder.Default
    // private Set<String> likedUserIds = new HashSet<>();
}