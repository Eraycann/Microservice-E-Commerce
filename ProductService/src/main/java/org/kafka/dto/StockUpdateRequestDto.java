package org.kafka.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockUpdateRequestDto {
    // Stok miktarındaki değişim (pozitif veya negatif delta)
    private Integer quantityDelta;
}
