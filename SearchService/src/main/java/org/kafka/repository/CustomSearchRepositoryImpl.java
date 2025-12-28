package org.kafka.repository;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.aggregations.*;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import co.elastic.clients.util.NamedValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.dto.SearchRequest;
import org.kafka.model.ProductIndex;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregation;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregations;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.ScriptType;
import org.springframework.data.elasticsearch.core.query.UpdateQuery;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Repository
@RequiredArgsConstructor
public class CustomSearchRepositoryImpl implements CustomSearchRepository {

    private final ElasticsearchOperations elasticsearchOperations;

    @Override
    public Page<ProductIndex> searchByFilters(
            String queryText,
            String brand,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Map<String, String> searchSpecs,
            Pageable pageable
    ) {
        log.debug("Filtreleme sorgusu oluşturuluyor: query='{}', brand='{}', category='{}'",
                queryText, brand, category);

        List<Query> mustQueries = new ArrayList<>();

        // 1. Sadece aktif ürünler
        mustQueries.add(QueryBuilders.term(t -> t.field("active").value(true)));

        // 2. Arama kutusu (multi-field search)
        if (StringUtils.hasText(queryText)) {
            mustQueries.add(QueryBuilders.multiMatch(m -> m
                    .query(queryText.trim())
                    .fields("name^3", "description^2", "brand", "category")
                    .fuzziness("AUTO")
                    .operator(co.elastic.clients.elasticsearch._types.query_dsl.Operator.And)
            ));
        }

        // 3. Marka filtresi (DÜZELTİLDİ: .keyword kaldırıldı)
        if (StringUtils.hasText(brand)) {
            mustQueries.add(QueryBuilders.term(t -> t
                    .field("brand") // Modelde zaten Keyword tipinde
                    .value(FieldValue.of(brand.trim()))
            ));
        }

        // 4. Kategori filtresi (DÜZELTİLDİ: .keyword kaldırıldı)
        if (StringUtils.hasText(category)) {
            mustQueries.add(QueryBuilders.term(t -> t
                    .field("category") // Modelde zaten Keyword tipinde
                    .value(FieldValue.of(category.trim()))
            ));
        }

        // 5. Fiyat aralığı
        if (minPrice != null || maxPrice != null) {
            mustQueries.add(QueryBuilders.range(r -> r
                    .number(n -> {
                        n.field("price");
                        if (minPrice != null) n.gte(minPrice.doubleValue());
                        if (maxPrice != null) n.lte(maxPrice.doubleValue());
                        return n;
                    })
            ));
        }

        // 6. Dinamik özellikler (specs)
        if (searchSpecs != null && !searchSpecs.isEmpty()) {
            for (Map.Entry<String, String> entry : searchSpecs.entrySet()) {
                if (StringUtils.hasText(entry.getValue())) {
                    // Specs içindeki alanlar için de .keyword kaldırıldı veya match kullanıldı
                    mustQueries.add(QueryBuilders.match(m -> m
                            .field("specs." + entry.getKey())
                            .query(FieldValue.of(entry.getValue().trim()))
                    ));
                }
            }
        }

        // Final query oluştur
        Query finalQuery = QueryBuilders.bool(b -> b.must(mustQueries));

        // Native query oluştur
        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(finalQuery)
                .withPageable(pageable)
                .build();

        // Arama yap
        SearchHits<ProductIndex> searchHits = elasticsearchOperations.search(
                nativeQuery, ProductIndex.class, IndexCoordinates.of("products")
        );

        // Sonuçları Page olarak döndür
        List<ProductIndex> products = searchHits.stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());

        log.debug("Filtreleme tamamlandı: {} sonuç bulundu", searchHits.getTotalHits());

        return new PageImpl<>(products, pageable, searchHits.getTotalHits());
    }

    @Override
    public List<String> autoSuggestProductNames(String input) {
        log.debug("Autocomplete sorgusu: input='{}'", input);

        if (!StringUtils.hasText(input) || input.trim().length() < 2) {
            return new ArrayList<>();
        }

        // Prefix query ile başlayan ürünleri bul
        Query prefixQuery = QueryBuilders.bool(b -> b
                .must(QueryBuilders.term(t -> t.field("active").value(true)))
                .must(QueryBuilders.prefix(p -> p
                        .field("name")
                        .value(input.trim().toLowerCase())
                ))
        );

        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(prefixQuery)
                .withMaxResults(10)
                .build();

        SearchHits<ProductIndex> searchHits = elasticsearchOperations.search(
                nativeQuery, ProductIndex.class, IndexCoordinates.of("products")
        );

        List<String> suggestions = searchHits.stream()
                .map(hit -> hit.getContent().getName())
                .distinct()
                .limit(10)
                .collect(Collectors.toList());

        log.debug("Autocomplete tamamlandı: {} öneri", suggestions.size());
        return suggestions;
    }

    @Override
    public void incrementSalesCount(String productId, int quantity) {
        log.debug("Satış sayısı güncelleniyor: productId={}, quantity={}", productId, quantity);

        try {
            String scriptCode = """
                if (ctx._source.salesCount == null) { 
                    ctx._source.salesCount = params.count 
                } else { 
                    ctx._source.salesCount += params.count 
                }
                """;

            Map<String, Object> params = new HashMap<>();
            params.put("count", quantity);

            UpdateQuery updateQuery = UpdateQuery.builder(productId)
                    .withScript(scriptCode)
                    .withParams(params)
                    .withScriptType(ScriptType.INLINE)
                    .withAbortOnVersionConflict(false)
                    .build();

            elasticsearchOperations.update(updateQuery, IndexCoordinates.of("products"));
            log.info("Satış sayısı güncellendi: productId={}, quantity={}", productId, quantity);
        } catch (Exception e) {
            log.error("Satış sayısı güncellenirken hata oluştu: productId={}", productId, e);
            throw new RuntimeException("Satış sayısı güncellenemedi", e);
        }
    }

    @Override
    public Page<ProductIndex> findBestSellers(Pageable pageable) {
        log.debug("Çok satan ürünler sorgulanıyor: page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());

        Query query = QueryBuilders.bool(b -> b
                .must(QueryBuilders.term(t -> t.field("active").value(true)))
                .must(QueryBuilders.range(r -> r
                        .number(n -> n.field("salesCount").gt(0.0))
                ))
        );

        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(query)
                .withPageable(pageable)
                .withSort(org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "salesCount"
                ))
                .build();

        SearchHits<ProductIndex> searchHits = elasticsearchOperations.search(
                nativeQuery, ProductIndex.class, IndexCoordinates.of("products")
        );

        List<ProductIndex> products = searchHits.stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());

        log.debug("Çok satan ürünler bulundu: {} adet", searchHits.getTotalHits());

        return new PageImpl<>(products, pageable, searchHits.getTotalHits());
    }

    @Override
    public Page<ProductIndex> findFeaturedProducts(Pageable pageable) {
        log.debug("Vitrin ürünleri sorgulanıyor: page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());

        Query query = QueryBuilders.bool(b -> b
                .must(QueryBuilders.term(t -> t.field("active").value(true)))
                .must(QueryBuilders.term(t -> t.field("featured").value(true)))
        );

        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(query)
                .withPageable(pageable)
                .build();

        SearchHits<ProductIndex> searchHits = elasticsearchOperations.search(
                nativeQuery, ProductIndex.class, IndexCoordinates.of("products")
        );

        List<ProductIndex> products = searchHits.stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());

        log.debug("Vitrin ürünleri bulundu: {} adet", searchHits.getTotalHits());

        return new PageImpl<>(products, pageable, searchHits.getTotalHits());
    }

    @Override
    public List<String> findTopBrands(int limit) {
        log.debug("En popüler markalar sorgulanıyor: limit={}", limit);

        try {
            NativeQuery query = NativeQuery.builder()
                    .withQuery(QueryBuilders.term(t -> t.field("active").value(true)))
                    .withAggregation("top_brands", Aggregation.of(a -> a
                            .terms(t -> t
                                    .field("brand") // DÜZELTİLDİ: .keyword kaldırıldı
                                    .size(limit)
                                    .order(List.of(NamedValue.of("total_sales", SortOrder.Desc)))
                            )
                            .aggregations("total_sales", sub -> sub
                                    .sum(s -> s.field("salesCount"))
                            )
                    ))
                    // DÜZELTİLDİ: Page size must not be less than one (0 -> 1 yapıldı)
                    .withPageable(PageRequest.of(0, 1))
                    .build();

            SearchHits<ProductIndex> response = elasticsearchOperations.search(
                    query, ProductIndex.class, IndexCoordinates.of("products")
            );

            if (!response.hasAggregations()) {
                log.warn("Aggregation sonucu bulunamadı");
                return new ArrayList<>();
            }

            ElasticsearchAggregations aggregations = (ElasticsearchAggregations) response.getAggregations();
            ElasticsearchAggregation aggregationWrapper = aggregations.get("top_brands");

            if (aggregationWrapper == null) {
                log.warn("top_brands aggregation bulunamadı");
                return new ArrayList<>();
            }

            Aggregate topBrandsAgg = aggregationWrapper.aggregation().getAggregate();

            if (topBrandsAgg.isSterms()) {
                StringTermsAggregate termsAgg = topBrandsAgg.sterms();
                List<StringTermsBucket> buckets = termsAgg.buckets().array();

                List<String> brands = buckets.stream()
                        .map(bucket -> bucket.key().stringValue())
                        .collect(Collectors.toList());

                log.debug("En popüler markalar bulundu: {} adet", brands.size());
                return brands;
            }

            log.warn("Aggregation sonucu beklenen tipte değil");
            return new ArrayList<>();

        } catch (Exception e) {
            log.error("En popüler markalar sorgulanırken hata oluştu", e);
            return new ArrayList<>();
        }
    }

    @Override
    public Page<ProductIndex> advancedSearch(SearchRequest request, Pageable pageable) {
        log.debug("Gelişmiş arama sorgusu oluşturuluyor: {}", request);

        List<Query> mustQueries = new ArrayList<>();

        // Sadece aktif ürünler
        mustQueries.add(QueryBuilders.term(t -> t.field("active").value(true)));

        // Arama sorgusu
        if (StringUtils.hasText(request.getQuery())) {
            mustQueries.add(QueryBuilders.multiMatch(m -> m
                    .query(request.getQuery().trim())
                    .fields("name^3", "description^2", "brand", "category")
                    .fuzziness("AUTO")
            ));
        }

        // Marka filtreleri (çoklu) - DÜZELTİLDİ
        if (request.getBrands() != null && !request.getBrands().isEmpty()) {
            List<String> validBrands = request.getBrands().stream()
                    .filter(StringUtils::hasText)
                    .map(String::trim)
                    .collect(Collectors.toList());

            if (!validBrands.isEmpty()) {
                mustQueries.add(QueryBuilders.terms(t -> t
                        .field("brand") // DÜZELTİLDİ: .keyword kaldırıldı
                        .terms(ts -> ts.value(validBrands.stream()
                                .map(FieldValue::of)
                                .collect(Collectors.toList())))
                ));
            }
        }

        // Kategori filtreleri (çoklu) - DÜZELTİLDİ
        if (request.getCategories() != null && !request.getCategories().isEmpty()) {
            List<String> validCategories = request.getCategories().stream()
                    .filter(StringUtils::hasText)
                    .map(String::trim)
                    .collect(Collectors.toList());

            if (!validCategories.isEmpty()) {
                mustQueries.add(QueryBuilders.terms(t -> t
                        .field("category") // DÜZELTİLDİ: .keyword kaldırıldı
                        .terms(ts -> ts.value(validCategories.stream()
                                .map(FieldValue::of)
                                .collect(Collectors.toList())))
                ));
            }
        }

        // Fiyat aralığı
        if (request.getMinPrice() != null || request.getMaxPrice() != null) {
            mustQueries.add(QueryBuilders.range(r -> r
                    .number(n -> {
                        n.field("price");
                        if (request.getMinPrice() != null) n.gte(request.getMinPrice().doubleValue());
                        if (request.getMaxPrice() != null) n.lte(request.getMaxPrice().doubleValue());
                        return n;
                    })
            ));
        }

        // Sadece vitrin ürünleri
        if (Boolean.TRUE.equals(request.getFeaturedOnly())) {
            mustQueries.add(QueryBuilders.term(t -> t.field("featured").value(true)));
        }

        // Dinamik özellikler - DÜZELTİLDİ
        if (request.getSpecs() != null && !request.getSpecs().isEmpty()) {
            for (Map.Entry<String, String> entry : request.getSpecs().entrySet()) {
                if (StringUtils.hasText(entry.getValue())) {
                    mustQueries.add(QueryBuilders.match(m -> m
                            .field("specs." + entry.getKey()) // DÜZELTİLDİ: .keyword kaldırıldı, match kullanıldı
                            .query(FieldValue.of(entry.getValue().trim()))
                    ));
                }
            }
        }

        Query finalQuery = QueryBuilders.bool(b -> b.must(mustQueries));

        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(finalQuery)
                .withPageable(pageable)
                .build();

        SearchHits<ProductIndex> searchHits = elasticsearchOperations.search(
                nativeQuery, ProductIndex.class, IndexCoordinates.of("products")
        );

        List<ProductIndex> products = searchHits.stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());

        log.debug("Gelişmiş arama tamamlandı: {} sonuç bulundu", searchHits.getTotalHits());

        return new PageImpl<>(products, pageable, searchHits.getTotalHits());
    }
}