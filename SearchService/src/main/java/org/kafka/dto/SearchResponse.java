package org.kafka.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kafka.model.ProductIndex;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponse {
    
    /** Bulunan ürünler */
    private List<ProductIndex> products;
    
    /** Toplam ürün sayısı */
    private long totalElements;
    
    /** Toplam sayfa sayısı */
    private int totalPages;
    
    /** Mevcut sayfa numarası (0-based) */
    private int currentPage;
    
    /** Sayfa başına ürün sayısı */
    private int pageSize;
    
    /** İlk sayfa mı? */
    private boolean first;
    
    /** Son sayfa mı? */
    private boolean last;
    
    /** Arama sorgusu */
    private String query;
    
    /** Arama süresi (ms) */
    private Long searchTimeMs;
    
    /** Toplam aktif ürün sayısı (istatistik için) */
    private Long totalActiveProducts;
}