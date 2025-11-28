package org.kafka.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BrandRequestDto {
    // Hem Create hem de Update için kullanılır.
    @NotBlank(message = "Marka adı boş bırakılamaz.")
    private String name;
}