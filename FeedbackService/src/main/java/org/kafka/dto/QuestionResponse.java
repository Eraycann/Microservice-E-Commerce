package org.kafka.dto;

import lombok.Data;

@Data
public class QuestionResponse {
    private String id;
    private String productId;
    private String userId;
    private String userFullName;
    private String questionText;

    // Cevap Alanları
    private String answerText;
    private String answeredBy;

    // Tarihleri String olarak tutuyoruz (Jackson hatasını bypass etmek için)
    private String askDate;
    private String answerDate;
}