package org.kafka.dto;

import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class ProductImageOrderUpdateDto {

    @NotNull
    private Long imageId;

    @NotNull
    @Min(value = 1, message = "Sıra (Order) 1 veya daha büyük olmalıdır.")
    private Integer displayOrder;

    // Bu resmin ana resim olup olmadığını belirtir.
    private boolean isMain;
}