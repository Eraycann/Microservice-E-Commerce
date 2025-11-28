package org.kafka.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.client.ProductServiceClient;
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

    /**
     * Kullanıcıya özel önerileri getirir.
     * AI varsa AI'dan, yoksa Popüler ürünlerden.
     */
    public List<ProductDto> getRecommendations(String userId) {

        // ADIM 1: Ürün ID'lerini bul (Candidate Generation)
        List<String> productIds = getProductIdsFromAI(userId);

        // Eğer AI çalışmazsa veya boş dönerse Fallback yap
        if (productIds.isEmpty()) {
            log.warn("AI servisi cevap vermedi veya boş döndü. Fallback: Popüler ürünler getiriliyor.");
            productIds = repository.findTop10PopularProductIds();
        }

        if (productIds.isEmpty()) {
            return new ArrayList<>(); // Hiç veri yoksa boş dön
        }

        // ADIM 2: Ürün Detaylarını Getir (Data Enrichment)
        // Product Service'e gidip "Bana bu ID'lerin resmini, fiyatını ver" diyoruz.
        try {
            return productServiceClient.getProductsByIds(productIds);
        } catch (Exception e) {
            log.error("Product Service'e ulaşılamadı: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    // --- Gelecekte Python'a bağlanacak Metot ---
    private List<String> getProductIdsFromAI(String userId) {
        // ŞİMDİLİK: Python servisi olmadığı için boş dönüyoruz.
        // İLERİDE: RestTemplate veya Feign ile Python API'ye istek atacağız.
        // return pythonClient.getRecommendations(userId);
        return new ArrayList<>();
    }
}