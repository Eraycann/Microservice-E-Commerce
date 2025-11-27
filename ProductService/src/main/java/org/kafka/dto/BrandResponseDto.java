package org.kafka.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BrandResponseDto {
    private Long id;
    private String name;
    private String slug;
}
