package org.kafka.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.client.AiEngineClient;
import org.kafka.client.ProductServiceClient;
import org.kafka.dto.AiRequest;
import org.kafka.dto.AiResponse;
import org.kafka.dto.ProductDto;
import org.kafka.repository.UserInteractionRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final UserInteractionRepository repository;
    private final ProductServiceClient productServiceClient;
    private final AiEngineClient aiEngineClient;

    /**
     * Kullanıcıya özel önerileri getirir.
     * AI varsa AI'dan, yoksa Popüler ürünlerden.
     */
    public List<ProductDto> getRecommendations(String userId) {

        // ADIM 1: Ürün ID'lerini bul (Candidate Generation)
        List<String> productIds = getProductIdsFromAI(userId);

        // ADIM 2: Eğer AI çalışmazsa veya boş dönerse Fallback Yap (Popüler Ürünler)
        if (productIds.isEmpty()) {
            log.warn("⚠️ AI servisi öneri yapamadı (Cold Start veya Hata). Fallback devreye giriyor.");
            productIds = repository.findTop10PopularProductIds();
        }

        // Hala boşsa (Veritabanı da boşsa yapacak bir şey yok)
        if (productIds.isEmpty()) {
            return new ArrayList<>();
        }

        // ADIM 3: Ürün Detaylarını Getir (Data Enrichment)
        // Product Service'e gidip "Bana bu ID'lerin resmini, fiyatını ver" diyoruz.
        try {
            return productServiceClient.getProductsByIds(productIds);
        } catch (Exception e) {
            log.error("❌ Product Service erişim hatası: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private List<String> getProductIdsFromAI(String userId) {
        try {
            // Python API'ye istek atıyoruz
            AiResponse response = aiEngineClient.getRecommendations(new AiRequest(userId));

            // --- DÜZELTİLEN KISIM: NULL KONTROLLERİ ---
            // response null gelebilir veya içi boş olabilir, kontrol etmezsek patlar.
            if (response != null && response.getRecommendations() != null && !response.getRecommendations().isEmpty()) {
                log.info("🤖 AI Motoru öneri yaptı: {} adet ürün", response.getRecommendations().size());
                return response.getRecommendations();
            }
        } catch (Exception e) {
            // Python kapalıysa veya hata verirse akışı bozma, boş liste dön ki Fallback çalışsın
            log.error("🔌 AI Engine bağlantı hatası veya kapalı: {}", e.getMessage());
        }
        return new ArrayList<>();
    }
}