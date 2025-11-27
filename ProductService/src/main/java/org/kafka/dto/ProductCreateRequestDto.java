package org.kafka.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductCreateRequestDto {

    // Temel Ürün Bilgileri
    @NotBlank(message = "Ürün adı boş bırakılamaz.")
    private String name;

    @NotBlank(message = "Açıklama boş bırakılamaz.")
    private String description;

    @NotNull(message = "Fiyat belirtilmelidir.")
    @DecimalMin(value = "0.01", message = "Fiyat 0.01'den küçük olamaz.")
    private BigDecimal price;

    // İlişki Anahtarları
    @NotNull(message = "Kategori ID'si gereklidir.")
    private Long categoryId;

    @NotNull(message = "Marka ID'si gereklidir.")
    private Long brandId;

    // Stok Bilgisi
    // NULL olabilir (varsayılan 0 olarak işlenebilir), ancak negatif olamaz.
    @Min(value = 0, message = "Başlangıç stok adedi negatif olamaz.")
    private Integer initialStockCount = 0;

    // Teknik Özellikler
    // JSONB verisi, zorunlu olmasa bile boş string olmamalıdır.
    // İş mantığınız, bu alanın zorunlu olup olmadığına karar verir.
    @NotNull(message = "Teknik özellik verisi gereklidir (boş olsa bile {} gönderilmelidir).")
    private String specsData;
}