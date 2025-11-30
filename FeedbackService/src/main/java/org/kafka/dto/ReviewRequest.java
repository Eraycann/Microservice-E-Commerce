package org.kafka.dto;

import lombok.Data;
import java.util.List;

@Data
public class ReviewRequest {
    private String productId;
    private int rating;
    private String comment;
    private List<String> imageUrls; // Frontend'den gelen resim linkleri
}