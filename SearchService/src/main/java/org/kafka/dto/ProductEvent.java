package org.kafka.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductEvent {
    private String eventType; // "CREATE", "UPDATE", "DELETE"
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String brandName;
    private String categoryName;
    private String slug;
    private String imageUrl;
    private boolean active;
}