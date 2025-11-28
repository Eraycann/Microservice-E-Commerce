package org.kafka.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageResponseDto {
    private Long id;
    private String url;
    private Integer displayOrder;
    private boolean isMain;
}
