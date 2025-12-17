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
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(indexName = "products") // ES'de 'products' isimli bir indeks oluşturur
@Setting(settingPath = "/es-settings.json") // Ayar dosyasını göster
public class ProductIndex {

    @Id
    private String id; // ES ID'leri String tutar

    @Field(type = FieldType.Text, analyzer = "my_custom_analyzer") // Bu analizörü kullan
    private String name; // "Iphone 15" aranınca "Iphone" yazsa da bulsun

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Keyword) // Tam eşleşme için (Filtreleme)
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

    // JSONB verisini burada Map olarak tutuyoruz.
    // Elasticsearch bunu "specs.color", "specs.size" gibi indeksler.
    @Field(type = FieldType.Object)
    private Map<String, Object> specs;

    @Field(type = FieldType.Boolean)
    private boolean featured; // Admin panelinden "Vitrinde Göster" denilen ürünler

    @Field(type = FieldType.Long)
    private Long salesCount; // Toplam satış adedi (Analitik Veri)
}