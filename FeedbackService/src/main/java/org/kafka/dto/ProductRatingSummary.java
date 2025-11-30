package org.kafka.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductRatingSummary {
    private String productId;
    private double averageRating;
    private long totalReviews;
    private Map<Integer, Long> starCounts; // 5 yıldız: 10 tane, 4 yıldız: 2 tane...
}