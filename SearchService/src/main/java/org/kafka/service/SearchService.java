package org.kafka.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.model.ProductIndex;
import org.kafka.repository.ProductSearchRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final ProductSearchRepository searchRepository;

    /**
     * Gelen veriyi Elasticsearch'e kaydeder (Indexler)
     */
    public void saveProduct(ProductIndex productIndex) {
        searchRepository.save(productIndex);
        log.info("✅ Ürün Elasticsearch'e indekslendi: {}", productIndex.getName());
    }

    /**
     * Ürünü Elasticsearch'ten siler
     */
    public void deleteProduct(String id) {
        searchRepository.deleteById(id);
        log.info("🗑️ Ürün Elasticsearch'ten silindi ID: {}", id);
    }

    /**
     * Dinamik Arama Metodu
     * Eğer 'query' boşsa tümünü getirir, doluysa isme göre arar.
     * İleride buraya CriteriaQuery ile daha gelişmiş filtreler eklenebilir.
     */
    public List<ProductIndex> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            // Iterable -> List dönüşümü
            return StreamSupport.stream(searchRepository.findAll().spliterator(), false)
                    .collect(Collectors.toList());
        }
        return searchRepository.findByNameContainingOrDescriptionContaining(query, query);
    }
}