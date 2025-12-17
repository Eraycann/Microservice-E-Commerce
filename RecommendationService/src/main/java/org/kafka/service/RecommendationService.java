package org.kafka.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.client.AiEngineClient;
import org.kafka.client.ProductServiceClient;
import org.kafka.dto.AiRequest;
import org.kafka.dto.AiResponse;
import org.kafka.dto.ProductDto;
import org.kafka.repository.UserInteractionRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.kafka.model.UserInteraction;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final UserInteractionRepository repository;
    private final ProductServiceClient productServiceClient;
    private final AiEngineClient aiEngineClient;
    private final MongoTemplate mongoTemplate; // Bulk Update için gerekli

    /**
     * Öneri Getir: UserId varsa ona göre, yoksa GuestId'ye göre.
     */
    public List<ProductDto> getRecommendations(String userId, String guestId) {
        // AI servisine hangisi varsa onu gönderiyoruz
        String targetId = (userId != null) ? userId : guestId;

        if (targetId == null) {
            // İkisi de yoksa direkt popüler ürünleri dön
            return getPopularProducts();
        }

        List<String> productIds = getProductIdsFromAI(targetId);

        if (productIds.isEmpty()) {
            log.warn("⚠️ AI öneri yapamadı. Fallback: Popüler Ürünler.");
            productIds = repository.findTop10PopularProductIds();
        }

        if (productIds.isEmpty()) return new ArrayList<>();

        try {
            return productServiceClient.getProductsByIds(productIds);
        } catch (Exception e) {
            log.error("❌ Product Service hatası: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private List<ProductDto> getPopularProducts() {
        List<String> ids = repository.findTop10PopularProductIds();
        return productServiceClient.getProductsByIds(ids);
    }

    private List<String> getProductIdsFromAI(String targetId) {
        try {
            AiResponse response = aiEngineClient.getRecommendations(new AiRequest(targetId));
            if (response != null && response.getRecommendations() != null && !response.getRecommendations().isEmpty()) {
                return response.getRecommendations();
            }
        } catch (Exception e) {
            log.error("🔌 AI Engine hatası: {}", e.getMessage());
        }
        return new ArrayList<>();
    }

    // --- MERGE İŞLEMİ (GUEST -> USER) ---
    public void mergeGuestData(String guestId, String userId) {
        // SQL: UPDATE user_interactions SET user_id = userId, guest_id = null WHERE guest_id = guestId

        Query query = new Query(Criteria.where("guestId").is(guestId));
        Update update = new Update().set("userId", userId).set("guestId", null); // guestId'yi silebiliriz veya tutabiliriz, null yapmak mantıklı.

        var result = mongoTemplate.updateMulti(query, update, UserInteraction.class);

        log.info("🔗 Merge Tamamlandı: {} adet etkileşim Guest({}) -> User({})'a taşındı.",
                result.getModifiedCount(), guestId, userId);
    }

    // Manuel Eğitim (Admin)
    public String triggerManualTraining() {
        try {
            Map<String, Object> response = aiEngineClient.trainModel();
            return "Eğitim Başlatıldı: " + response.toString();
        } catch (Exception e) {
            return "Hata: " + e.getMessage();
        }
    }
}