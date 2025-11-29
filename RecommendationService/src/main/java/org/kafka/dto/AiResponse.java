package org.kafka.dto;

import lombok.Data;

import java.util.List;

@Data
public class AiResponse {
    private String userId;
    private List<String> recommendations;
}
