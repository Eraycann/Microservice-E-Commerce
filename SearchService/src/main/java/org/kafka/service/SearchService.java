package org.kafka.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.model.ProductIndex;
import org.kafka.repository.ProductSearchRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final ProductSearchRepository searchRepository;

    public void saveProduct(ProductIndex productIndex) {
        searchRepository.save(productIndex);
    }

    public void deleteProduct(String id) {
        searchRepository.deleteById(id);
    }

    // --- YENİLENMİŞ ARAMA METODLARI ---

    /**
     * SENARYO 1: Basit Arama Kutusu
     * Pageable eklendi (Varsayılan: Sayfa 0, Boyut 20)
     */
    public List<ProductIndex> search(String query) {
        // Repository artık 7 argüman bekliyor (sonuncusu Pageable)
        // Dönen Page nesnesinin içeriğini (.getContent()) alarak List'e çeviriyoruz.
        return searchRepository.searchByFilters(
                query,
                null,
                null,
                null,
                null,
                null,
                PageRequest.of(0, 20)
        ).getContent();
    }

    /**
     * SENARYO 2: Detaylı Filtreleme
     * Double -> BigDecimal dönüşümü ve Pageable eklendi.
     */
    public List<ProductIndex> filterProducts(
            String query,
            String brand,
            String category,
            Double minPrice,
            Double maxPrice,
            Map<String, String> specs
    ) {
        // Double gelen fiyatları BigDecimal'e çeviriyoruz (Repository öyle bekliyor)
        BigDecimal min = minPrice != null ? BigDecimal.valueOf(minPrice) : null;
        BigDecimal max = maxPrice != null ? BigDecimal.valueOf(maxPrice) : null;

        return searchRepository.searchByFilters(
                query,
                brand,
                category,
                min,
                max,
                specs,
                PageRequest.of(0, 20) // Varsayılan sayfalama
        ).getContent();
    }

    /**
     * SENARYO 3: Autocomplete
     */
    public List<String> autoSuggest(String input) {
        if (input == null || input.length() < 2) {
            return List.of();
        }
        return searchRepository.autoSuggestProductNames(input);
    }

    // 1. Öne Çıkan Ürünler
    public List<ProductIndex> getFeaturedProducts() {
        // Eski metod: findByFeaturedTrue() yoktu.
        // Yeni metod: findFeaturedProducts(Pageable)
        return searchRepository.findFeaturedProducts(PageRequest.of(0, 10)).getContent();
    }

    // 2. Çok Satanlar
    public List<ProductIndex> getBestSellers() {
        // HATA BURADAYDI: int değil Pageable gönderiyoruz.
        return searchRepository.findBestSellers(PageRequest.of(0, 10)).getContent();
    }

    // 3. Popüler Markalar
    public List<String> getTopBrands() {
        // Bu metodda değişiklik yok, int limit alıyor.
        return searchRepository.findTopBrands(5);
    }

    // 4. Satış Sayısı Güncelleme
    public void updateSalesCount(String productId, int quantity) {
        searchRepository.incrementSalesCount(productId, quantity);
    }
}