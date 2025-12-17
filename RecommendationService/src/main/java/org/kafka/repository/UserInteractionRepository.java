package org.kafka.repository;

import org.kafka.model.UserInteraction;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserInteractionRepository extends MongoRepository<UserInteraction, String> {

    // Popüler Ürünler (En çok etkileşim alanlar)
    @Aggregation(pipeline = {
            "{ '$group': { '_id': '$productId', 'count': { '$sum': 1 } } }",
            "{ '$sort': { 'count': -1 } }",
            "{ '$limit': 10 }",
            "{ '$project': { '_id': 1 } }"
    })
    List<String> findTop10PopularProductIds();

    // Belirli bir kullanıcının etkileşimleri (AI fallback için)
    List<UserInteraction> findByUserId(String userId);
}