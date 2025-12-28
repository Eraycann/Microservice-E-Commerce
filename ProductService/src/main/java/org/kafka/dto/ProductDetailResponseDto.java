package org.kafka.dto;


import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ProductDetailResponseDto {
    private Long id;
    private String slug;
    private String name;
    private String description;
    private BigDecimal price;

    private String categoryName;
    private String brandName;
    private Integer stockCount;
    private String specsData;

    // Frontend compatibility fields
    private Integer stockQuantity;  // Alias for stockCount
    private Boolean inStock;        // Computed from stockCount > 0
    private Double rating;          // Default to 0.0 for now
    private Integer reviewCount;    // Default to 0 for now
    private Boolean featured;       // Featured status
    private Boolean active;         // Active status

    // --- DEĞİŞİKLİK ---
    // Artık sadece String listesi değil, detaylı resim objesi listesi dönüyoruz.
    private List<ProductImageResponseDto> images;
    
    // Frontend compatibility - computed fields
    public Integer getStockQuantity() {
        return stockCount;
    }
    
    public Boolean getInStock() {
        return stockCount != null && stockCount > 0;
    }
    
    public Double getRating() {
        return rating != null ? rating : 0.0;
    }
    
    public Integer getReviewCount() {
        return reviewCount != null ? reviewCount : 0;
    }
}
