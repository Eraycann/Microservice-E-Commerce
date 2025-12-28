package org.kafka.dto;

import lombok.Data;

@Data
public class AnswerRequest {
    private String answer;  // Changed from answerText to match frontend
}