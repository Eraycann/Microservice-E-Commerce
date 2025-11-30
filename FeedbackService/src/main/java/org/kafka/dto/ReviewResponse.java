package org.kafka.dto;

import lombok.Data;

import java.time.Instant;
import java.util.List;
// import java.time.Instant; // Bunu silebilirsin veya kalabilir

@Data
public class ReviewResponse {
    private String id;
    private String username;
    private String comment;
    private int rating;
    private int helpfulCount;
    private List<String> imageUrls;

    // --- DEĞİŞİKLİK BURADA ---
    // Instant yerine String kullanıyoruz. Jackson String'i her zaman sever.
    private Instant createdAt;}