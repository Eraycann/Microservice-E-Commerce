package org.kafka.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.dto.AnswerRequest;
import org.kafka.dto.QuestionRequest;
import org.kafka.dto.QuestionResponse;
import org.kafka.model.ProductQuestion;
import org.kafka.service.QuestionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions") // URL yapısını ayırdık
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    // 1. Soru Sor (Herkes)
    @PostMapping
    public ProductQuestion askQuestion(@AuthenticationPrincipal Jwt jwt, @RequestBody QuestionRequest request) {
        String fullName = jwt.getClaimAsString("name");
        String userId = jwt.getClaimAsString("sub");

        return questionService.askQuestion(userId, fullName, request);
    }

    // 2. Soruyu Cevapla (SADECE SUPERUSER)
    @PutMapping("/{questionId}/answer")
    @PreAuthorize("hasRole('superuser')")
    public ProductQuestion answerQuestion(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String questionId,
            @RequestBody AnswerRequest request) {

        String adminName = jwt.getClaimAsString("name");
        return questionService.answerQuestion(questionId, adminName, request);
    }

    // 3. Ürünün Sorularını Getir (Public)
    @GetMapping("/product/{productId}")
    public Page<QuestionResponse> getQuestions(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return questionService.getQuestionsByProduct(productId, PageRequest.of(page, size, Sort.by("askDate").descending()));
    }

    // 4. Cevaplanmamış Soruları Getir (SADECE SUPERUSER)
    @GetMapping("/pending")
    @PreAuthorize("hasRole('superuser')")
    public Page<QuestionResponse> getPendingQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return questionService.getUnansweredQuestions(PageRequest.of(page, size, Sort.by("askDate").ascending()));
    }
}