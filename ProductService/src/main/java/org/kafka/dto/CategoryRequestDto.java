package org.kafka.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequestDto {
    @NotBlank(message = "Kategori adı boş bırakılamaz.")
    private String name;

    // Hiyerarşi desteği için. Create'te null, Update'te değişebilir.
    private Long parentId;
}
