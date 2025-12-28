package org.kafka.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductDto {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String slug;
    private String brand;
    private String category;
    private boolean active;

    // --- EKLENEN KISIMLAR ---

    // 1. Product Service'den gelen "images" listesini karşılamak için
    // (Product Service JSON çıktısında 'images' array'i dönüyor)
    private List<ImageDto> images;

    // 2. Frontend'e tek bir "imageUrl" stringi dönmek için getter override ediyoruz.
    // Jackson kütüphanesi JSON oluştururken bu metodu çağırır.
    public String getImageUrl() {
        // Eğer images listesi doluysa, ilk resmin URL'sini döndür
        if (this.images != null && !this.images.isEmpty()) {
            return this.images.get(0).getUrl();
        }
        return null;
    }

    // Gelen resim objesini karşılayan iç sınıf
    @Data
    public static class ImageDto {
        private String url;
        private boolean isMain;
        private int displayOrder;
    }
}