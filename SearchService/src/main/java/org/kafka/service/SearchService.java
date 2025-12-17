package org.kafka.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.model.ProductIndex;
import org.kafka.repository.ProductSearchRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final ProductSearchRepository searchRepository;

    // ... (saveProduct ve deleteProduct metodları aynen kalıyor) ...
    public void saveProduct(ProductIndex productIndex) {
        searchRepository.save(productIndex);
    }

    public void deleteProduct(String id) {
        searchRepository.deleteById(id);
    }

    // --- YENİLENMİŞ ARAMA METODLARI ---

    /**
     * SENARYO 1: Basit Arama Kutusu
     * Kullanıcı sadece yazı yazar. Diğer filtreler boştur.
     */
    public List<ProductIndex> search(String query) {
        // Tüm filtreleri null geçerek ana metodu çağırıyoruz.
        return searchRepository.searchByFilters(query, null, null, null, null, null);
    }

    /**
     * SENARYO 2: Detaylı Filtreleme
     * Kullanıcı hem arama yapabilir hem de filtre seçebilir.
     */
    public List<ProductIndex> filterProducts(
            String query,
            String brand,
            String category,
            Double minPrice,
            Double maxPrice,
            Map<String, String> specs
    ) {
        return searchRepository.searchByFilters(query, brand, category, minPrice, maxPrice, specs);
    }

    /**
     * SENARYO 3: Autocomplete
     * Kullanıcı harflere bastıkça çalışır.
     */
    public List<String> autoSuggest(String input) {
        if (input == null || input.length() < 2) {
            return List.of(); // En az 2 harf yazılmalı
        }
        return searchRepository.autoSuggestProductNames(input);
    }

    // 1. Öne Çıkan Ürünler (Featured = true)
    public List<ProductIndex> getFeaturedProducts() {
        // Doğrudan Spring Data Repository metodu türetebiliriz veya CustomRepo kullanabiliriz.
        // En kolayı Repository interface'ine şunu eklemektir: List<ProductIndex> findByFeaturedTrue();
        // Ama şimdilik Native mantığıyla Repository'e eklemediysek, service içinde çözebiliriz:
        return searchRepository.findByFeaturedTrue(); // Bunu interface'e ekleyeceğiz
    }

    // 2. Çok Satanlar
    public List<ProductIndex> getBestSellers() {
        return searchRepository.findBestSellers(10); // İlk 10
    }

    // 3. Popüler Markalar
    public List<String> getTopBrands() {
        return searchRepository.findTopBrands(5); // İlk 5 marka
    }

    // 4. Sipariş Geldiğinde Çalışacak Metot (RabbitMQ Listener bunu çağıracak)
    public void updateSalesCount(String productId, int quantity) {
        searchRepository.incrementSalesCount(productId, quantity);
    }
}