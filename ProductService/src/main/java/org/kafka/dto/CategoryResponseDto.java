package org.kafka.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryResponseDto {
    private Long id;
    private String name;
    private String slug;

    // Hiyerarşiyi göstermek için
    private Long parentId;
    private String parentName;
}
