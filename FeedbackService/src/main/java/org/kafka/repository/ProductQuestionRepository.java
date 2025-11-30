package org.kafka.repository;

import org.kafka.model.ProductQuestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductQuestionRepository extends MongoRepository<ProductQuestion, String> {

    // Ürüne ait soruları getir (Sayfalı)
    Page<ProductQuestion> findByProductId(String productId, Pageable pageable);

    // Cevaplanmamış soruları getir (Admin Paneli İçin)
    // answerText alanı null olanları bul
    Page<ProductQuestion> findByAnswerTextIsNull(Pageable pageable);
}