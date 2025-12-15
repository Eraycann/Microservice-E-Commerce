package org.kafka.repository;

import co.elastic.clients.elasticsearch._types.FieldValue; // EKLENDİ
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import lombok.RequiredArgsConstructor;
import org.kafka.model.ProductIndex;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class CustomSearchRepositoryImpl implements CustomSearchRepository {

    private final ElasticsearchOperations elasticsearchOperations;

    @Override
    public List<ProductIndex> searchByFilters(
            String queryText,
            String brand,
            String category,
            Double minPrice,
            Double maxPrice,
            Map<String, String> searchSpecs
    ) {
        List<Query> mustQueries = new ArrayList<>();

        // 1. AKTİF ÜRÜNLER (Zorunlu)
        // .value(true) -> .value(FieldValue.of(true)) yapmak daha garantidir ama boolean direkt çalışır.
        mustQueries.add(QueryBuilders.term(t -> t.field("active").value(true)));

        // 2. ARAMA KUTUSU (MultiMatch)
        if (queryText != null && !queryText.trim().isEmpty()) {
            mustQueries.add(QueryBuilders.multiMatch(m -> m
                    .query(queryText)
                    .fields("name^3", "description", "brand", "category")
                    .fuzziness("AUTO")
            ));
        }

        // 3. MARKA FİLTRESİ
        if (brand != null && !brand.isEmpty()) {
            // String değerleri FieldValue.of() içine almak en güvenli yoldur
            mustQueries.add(QueryBuilders.term(t -> t.field("brand").value(FieldValue.of(brand))));
        }

        // 4. KATEGORİ FİLTRESİ
        if (category != null && !category.isEmpty()) {
            mustQueries.add(QueryBuilders.term(t -> t.field("category").value(FieldValue.of(category))));
        }

        // 5. FİYAT ARALIĞI (Range Query) - DÜZELTİLEN KISIM 🛠️
        if (minPrice != null || maxPrice != null) {
            mustQueries.add(QueryBuilders.range(r -> r
                    .number(n -> { // <--- BURASI EKLENDİ (Sayısal aralık olduğunu belirtiyoruz)
                        n.field("price"); // .field() metodu .number() bloğunun içindedir.

                        if (minPrice != null) n.gte(minPrice); // Double değer alır
                        if (maxPrice != null) n.lte(maxPrice); // Double değer alır

                        return n;
                    })
            ));
        }

        // 6. DİNAMİK ÖZELLİKLER (Specs)
        if (searchSpecs != null && !searchSpecs.isEmpty()) {
            for (Map.Entry<String, String> entry : searchSpecs.entrySet()) {
                mustQueries.add(QueryBuilders.term(t -> t
                        .field("specs." + entry.getKey())
                        .value(FieldValue.of(entry.getValue())) // String -> FieldValue çevrimi
                ));
            }
        }

        Query finalQuery = QueryBuilders.bool(b -> b.must(mustQueries));

        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(finalQuery)
                .build();

        SearchHits<ProductIndex> searchHits = elasticsearchOperations.search(nativeQuery, ProductIndex.class);

        return searchHits.stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> autoSuggestProductNames(String input) {
        Query query = QueryBuilders.prefix(p -> p
                .field("name")
                .value(input) // Prefix query string kabul eder, sorun yok
        );

        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(query)
                .withPageable(PageRequest.of(0, 5))
                .build();

        SearchHits<ProductIndex> searchHits = elasticsearchOperations.search(nativeQuery, ProductIndex.class);

        return searchHits.stream()
                .map(hit -> hit.getContent().getName())
                .collect(Collectors.toList());
    }
}