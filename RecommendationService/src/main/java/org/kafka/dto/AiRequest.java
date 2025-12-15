package org.kafka.dto;

import lombok.Data;

// DTO'lar (Class içinde veya ayrı dosyada olabilir)
@Data
public class AiRequest {
    private String userId;

    public AiRequest(String userId) {
        this.userId = userId;
    }
}
