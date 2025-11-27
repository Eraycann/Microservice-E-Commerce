package org.kafka.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpecsUpdateRequestDto {
    // Tüm JSONB içeriği yeni değerle değiştirilir.
    private String specsData;
}
