package org.kafka.repository;

import org.kafka.model.UserInteraction;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserInteractionRepository extends MongoRepository<UserInteraction, String> {

    // MongoDB Aggregation Pipeline:
    // 1. productId'ye göre grupla.
    // 2. Her grubu say (count).
    // 3. Sayıya göre tersten sırala (En çoktan en aza).
    // 4. İlk 10 tanesini al.
    // 5. Sadece _id (yani productId) alanını dön.
    @Aggregation(pipeline = {
            "{ '$group': { '_id': '$productId', 'count': { '$sum': 1 } } }",
            "{ '$sort': { 'count': -1 } }",
            "{ '$limit': 10 }",
            "{ '$project': { '_id': 1 } }"
    })
    List<String> findTop10PopularProductIds();
}