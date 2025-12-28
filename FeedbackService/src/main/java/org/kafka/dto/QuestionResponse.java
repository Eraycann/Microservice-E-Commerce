package org.kafka.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class QuestionResponse {
    private String id;
    private String productId;
    private String userId;
    private String userFullName;
    private String question;  // Changed from questionText to match frontend
    
    // Cevap Alanları
    private String answer;    // Changed from answerText to match frontend
    private String answeredBy;
    
    // Tarihleri String olarak tutuyoruz (Jackson hatasını bypass etmek için)
    private Instant askDate;
    private Instant answerDate;
    
    // Frontend compatibility - computed field
    public boolean isAnswered() {
        return answer != null && !answer.trim().isEmpty();
    }
}