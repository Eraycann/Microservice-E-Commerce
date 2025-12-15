package org.kafka.dto;

import lombok.Data;

@Data
public class QuestionRequest {
    private String productId;
    private String questionText;
}