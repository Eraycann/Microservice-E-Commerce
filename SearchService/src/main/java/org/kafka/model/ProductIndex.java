package org.kafka.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Setting;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(indexName = "products")
@Setting(settingPath = "/es-settings.json")
public class ProductIndex {

    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "my_custom_analyzer")
    private String name;

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Keyword)
    private String brand;

    @Field(type = FieldType.Keyword)
    private String category;

    @Field(type = FieldType.Double)
    private BigDecimal price;

    @Field(type = FieldType.Boolean)
    private boolean active;

    @Field(type = FieldType.Keyword)
    private String slug;

    @Field(type = FieldType.Keyword)
    private String imageUrl;

    /** Ürün özellikleri (JSONB verisi Map olarak) */
    @Field(type = FieldType.Object)
    private Map<String, Object> specs;

    /** Vitrin ürünü mü? */
    @Field(type = FieldType.Boolean)
    private boolean featured;

    /** Toplam satış adedi (analitik veri) */
    @Field(type = FieldType.Long)
    @Builder.Default
    private Long salesCount = 0L;

    /** Ürün rating'i (ortalama puan) */
    @Field(type = FieldType.Double)
    @Builder.Default
    private Double rating = 0.0;

    /** Toplam yorum sayısı */
    @Field(type = FieldType.Integer)
    @Builder.Default
    private Integer reviewCount = 0;

    /** Stok miktarı */
    @Field(type = FieldType.Integer)
    @Builder.Default
    private Integer stockQuantity = 0;

    /** Oluşturulma tarihi */
    @Field(type = FieldType.Date)
    private LocalDateTime createdAt;

    /** Güncellenme tarihi */
    @Field(type = FieldType.Date)
    private LocalDateTime updatedAt;

    /** Ürün kategorisi ID'si (ilişkisel veri için) */
    @Field(type = FieldType.Keyword)
    private String categoryId;

    /** Marka ID'si (ilişkisel veri için) */
    @Field(type = FieldType.Keyword)
    private String brandId;

    /** Ürün etiketleri */
    @Field(type = FieldType.Keyword)
    private String[] tags;

    /** İndirim oranı (%) */
    @Field(type = FieldType.Double)
    @Builder.Default
    private Double discountPercentage = 0.0;

    /** İndirimli fiyat */
    @Field(type = FieldType.Double)
    private BigDecimal discountedPrice;

    /** Stokta var mı? */
    public boolean isInStock() {
        return active && stockQuantity != null && stockQuantity > 0;
    }

    /** İndirimli mi? */
    public boolean isDiscounted() {
        return discountPercentage != null && discountPercentage > 0 && discountedPrice != null;
    }

    /** Efektif fiyat (indirimli varsa indirimli, yoksa normal) */
    public BigDecimal getEffectivePrice() {
        return isDiscounted() ? discountedPrice : price;
    }
}