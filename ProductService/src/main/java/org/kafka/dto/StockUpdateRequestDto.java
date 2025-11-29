package org.kafka.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockUpdateRequestDto {
    // Stok miktarındaki değişim (pozitif veya negatif delta)
    @NotNull(message = "Stok değişim miktarı (quantityDelta) boş bırakılamaz.")
    private Integer quantityDelta;
}
