package org.kafka.repository;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.aggregations.*;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import co.elastic.clients.util.NamedValue; // Aggregation Order için gerekli
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // LOG İÇİN GEREKLİ
import org.kafka.model.ProductIndex;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregation;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregations; // Spring Data Wrapper
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.ScriptType;
import org.springframework.data.elasticsearch.core.query.UpdateQuery;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j // 1. HATA ÇÖZÜMÜ: log nesnesi için eklendi
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

        // 1. AKTİF ÜRÜNLER
        mustQueries.add(QueryBuilders.term(t -> t.field("active").value(true)));

        // 2. ARAMA KUTUSU
        if (queryText != null && !queryText.trim().isEmpty()) {
            mustQueries.add(QueryBuilders.multiMatch(m -> m
                    .query(queryText)
                    .fields("name^3", "description", "brand", "category")
                    .fuzziness("AUTO")
            ));
        }

        // 3. MARKA
        if (brand != null && !brand.isEmpty()) {
            mustQueries.add(QueryBuilders.term(t -> t.field("brand").value(FieldValue.of(brand))));
        }

        // 4. KATEGORİ
        if (category != null && !category.isEmpty()) {
            mustQueries.add(QueryBuilders.term(t -> t.field("category").value(FieldValue.of(category))));
        }

        // 5. FİYAT ARALIĞI
        if (minPrice != null || maxPrice != null) {
            mustQueries.add(QueryBuilders.range(r -> r
                    .number(n -> {
                        n.field("price");
                        if (minPrice != null) n.gte(minPrice);
                        if (maxPrice != null) n.lte(maxPrice);
                        return n;
                    })
            ));
        }

        // 6. DİNAMİK ÖZELLİKLER
        if (searchSpecs != null && !searchSpecs.isEmpty()) {
            for (Map.Entry<String, String> entry : searchSpecs.entrySet()) {
                mustQueries.add(QueryBuilders.term(t -> t
                        .field("specs." + entry.getKey())
                        .value(FieldValue.of(entry.getValue()))
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
                .value(input)
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

    @Override
    public void incrementSalesCount(String productId, int quantity) {
        String scriptCode = "if (ctx._source.salesCount == null) { ctx._source.salesCount = params.count } else { ctx._source.salesCount += params.count }";

        Map<String, Object> params = new HashMap<>();
        params.put("count", quantity);

        UpdateQuery updateQuery = UpdateQuery.builder(productId)
                .withScript(scriptCode)
                .withParams(params)
                .withScriptType(ScriptType.INLINE)
                .withAbortOnVersionConflict(false)
                .build();

        elasticsearchOperations.update(updateQuery, IndexCoordinates.of("products"));
        log.info("📈 Satış sayısı güncellendi. ProductID: {}, Adet: {}", productId, quantity);
    }

    @Override
    public List<ProductIndex> findBestSellers(int limit) {
        NativeQuery query = NativeQuery.builder()
                .withQuery(QueryBuilders.matchAll(m -> m))
                .withSort(Sort.by(Sort.Direction.DESC, "salesCount"))
                .withPageable(PageRequest.of(0, limit))
                .build();

        return elasticsearchOperations.search(query, ProductIndex.class)
                .stream().map(SearchHit::getContent).collect(Collectors.toList());
    }

    // --- HATALI OLAN METOD DÜZELTİLDİ ---
    @Override
    public List<String> findTopBrands(int limit) {
        NativeQuery query = NativeQuery.builder()
                .withQuery(QueryBuilders.matchAll(m -> m))
                .withAggregation("top_brands", Aggregation.of(a -> a
                        .terms(t -> t
                                .field("brand")
                                .size(limit)
                                // Not: Order metodu List<NamedValue> bekler.
                                .order(List.of(NamedValue.of("total_sales", SortOrder.Desc)))
                        )
                        .aggregations("total_sales", sub -> sub
                                .sum(s -> s.field("salesCount"))
                        )
                ))
                .withPageable(PageRequest.of(0, 0))
                .build();

        SearchHits<ProductIndex> response = elasticsearchOperations.search(query, ProductIndex.class);

        if (!response.hasAggregations()) return new ArrayList<>();

        // 1. Spring Data Wrapper'ını al
        ElasticsearchAggregations aggregations = (ElasticsearchAggregations) response.getAggregations();

        // 2. Wrapper içinden ilgili Aggregation Wrapper'ını al (Bu henüz native Aggregate değil)
        // Dönüş tipi: org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregation
        ElasticsearchAggregation aggregationWrapper = aggregations.get("top_brands");

        if (aggregationWrapper == null) {
            return new ArrayList<>();
        }

        // 3. Wrapper'ın içinden Native Client 'Aggregate' nesnesini çıkart
        Aggregate topBrandsAgg = aggregationWrapper.aggregation().getAggregate();

        // 4. Tür kontrolü ve veri çekme
        if (topBrandsAgg.isSterms()) {
            StringTermsAggregate termsAgg = topBrandsAgg.sterms();
            List<StringTermsBucket> buckets = termsAgg.buckets().array();

            return buckets.stream()
                    .map(bucket -> bucket.key().stringValue())
                    .collect(Collectors.toList());
        }

        return new ArrayList<>();
    }
}