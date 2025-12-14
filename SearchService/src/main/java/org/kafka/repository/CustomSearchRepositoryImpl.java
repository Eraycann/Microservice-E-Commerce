package org.kafka.repository;

import lombok.RequiredArgsConstructor;
import org.kafka.model.ProductIndex;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class CustomSearchRepositoryImpl implements CustomSearchRepository {

    private final ElasticsearchOperations elasticsearchOperations;

    @Override
    public List<ProductIndex> searchByFilters(
            String query,
            String brand,
            String category,
            Double minPrice,
            Double maxPrice,
            Map<String, String> searchSpecs
    ) {
        // 1. Temel Kriter: Sadece aktif ürünler
        Criteria criteria = new Criteria("active").is(true);

        // 2. ARAMA KUTUSU MANTIĞI (Full-Text Search)
        // Eğer kullanıcı bir şey yazdıysa; bunu İsimde VEYA Açıklamada VEYA Markada ararız.
        if (query != null && !query.trim().isEmpty()) {
            criteria = criteria.subCriteria(new Criteria()
                    .or("name").contains(query)
                    .or("description").contains(query)
                    .or("brand").contains(query) // Marka isminde de arama yapsın
                    .or("category").contains(query) // Kategori isminde de arama yapsın
            );
        }

        // 3. FİLTRELEME MANTIĞI (Faceted Search)

        // Marka Filtresi (Kesin Eşleşme)
        if (brand != null && !brand.isEmpty()) {
            criteria = criteria.and("brand").is(brand);
        }

        // Kategori Filtresi (Kesin Eşleşme)
        if (category != null && !category.isEmpty()) {
            criteria = criteria.and("category").is(category);
        }

        // Fiyat Aralığı
        if (minPrice != null && maxPrice != null) {
            criteria = criteria.and("price").between(minPrice, maxPrice);
        } else if (minPrice != null) {
            criteria = criteria.and("price").greaterThanEqual(minPrice);
        } else if (maxPrice != null) {
            criteria = criteria.and("price").lessThanEqual(maxPrice);
        }

        // 4. DİNAMİK ÖZELLİK FİLTRESİ (Specs)
        // Örn: specs.color = "Blue"
        if (searchSpecs != null && !searchSpecs.isEmpty()) {
            for (Map.Entry<String, String> entry : searchSpecs.entrySet()) {
                criteria = criteria.and("specs." + entry.getKey()).is(entry.getValue());
            }
        }

        // Sorguyu Çalıştır
        CriteriaQuery searchCode = new CriteriaQuery(criteria);
        SearchHits<ProductIndex> searchHits = elasticsearchOperations.search(searchCode, ProductIndex.class);

        return searchHits.stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());
    }
}