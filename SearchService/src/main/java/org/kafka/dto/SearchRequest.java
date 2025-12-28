package org.kafka.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {
    
    /** Arama sorgusu */
    @Size(max = 100, message = "Arama sorgusu 100 karakterden uzun olamaz")
    private String query;
    
    /** Marka filtreleri */
    private List<@Size(max = 50) String> brands;
    
    /** Kategori filtreleri */
    private List<@Size(max = 50) String> categories;
    
    /** Minimum fiyat */
    @Min(value = 0, message = "Minimum fiyat 0'dan küçük olamaz")
    private BigDecimal minPrice;
    
    /** Maksimum fiyat */
    @Min(value = 0, message = "Maksimum fiyat 0'dan küçük olamaz")
    private BigDecimal maxPrice;
    
    /** Sadece stokta olan ürünler */
    private Boolean inStockOnly;
    
    /** Sadece vitrin ürünleri */
    private Boolean featuredOnly;
    
    /** Minimum rating */
    @Min(value = 0, message = "Minimum rating 0'dan küçük olamaz")
    @Max(value = 5, message = "Maksimum rating 5'ten büyük olamaz")
    private Double minRating;
    
    /** Ürün özellikleri (specs) */
    private Map<String, String> specs;
    
    /** Sıralama kriteri */
    private String sortBy;
    
    /** Sıralama yönü (ASC/DESC) */
    private String sortDirection;
    
    /** Sayfa numarası (0-based) */
    @Min(value = 0, message = "Sayfa numarası 0'dan küçük olamaz")
    private Integer page;
    
    /** Sayfa boyutu */
    @Min(value = 1, message = "Sayfa boyutu 1'den küçük olamaz")
    @Max(value = 100, message = "Sayfa boyutu 100'den büyük olamaz")
    private Integer size;
    
    // Varsayılan değerler için helper metodlar
    public int getPageOrDefault() {
        return page != null ? page : 0;
    }
    
    public int getSizeOrDefault() {
        return size != null ? size : 20;
    }
    
    public String getSortByOrDefault() {
        return sortBy != null ? sortBy : "relevance";
    }
    
    public String getSortDirectionOrDefault() {
        return sortDirection != null ? sortDirection : "DESC";
    }
}