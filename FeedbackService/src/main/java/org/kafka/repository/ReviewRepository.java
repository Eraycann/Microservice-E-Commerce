package org.kafka.repository;

// import org.kafka.dto.ReviewSummaryDto; // Bunu aşağıda oluşturacağız
import org.kafka.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReviewRepository extends MongoRepository<Review, String> {

    Page<Review> findByProductId(String productId, Pageable pageable);
    boolean existsByUserIdAndProductId(String userId, String productId);

    // --- YENİ: İSTATİSTİK SORGUSU ---
    // Bu sorgu şunu yapar:
    // 1. İlgili ürünün yorumlarını filtrele (match)
    // 2. Rating'e göre grupla ve say (group)
    // 3. Sonucu yansıt (project)
    // Not: MongoDB Aggregation söz dizimi biraz karışıktır ama çok güçlüdür.
    // Spring Data MongoDB bunu bizim için DTO'ya map edebilir ama
    // karmaşık aggregation için genelde Custom Repository veya MongoTemplate kullanılır.
    // Basit ortalama için şunu kullanabiliriz:
}