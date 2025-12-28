package org.kafka.dto;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class ReviewResponse {
    private String id;
    private String username;
    private String comment;
    private int rating;
    private int helpfulCount;
    private List<String> imageUrls;
    private Instant createdAt;
}