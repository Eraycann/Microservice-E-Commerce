package org.kafka.service;

import lombok.RequiredArgsConstructor;
import org.kafka.dto.AnswerRequest;
import org.kafka.dto.QuestionRequest;
import org.kafka.dto.QuestionResponse;
import org.kafka.dto.RestPage;
import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.code.FeedbackErrorCode;
import org.kafka.mapper.QuestionMapper;
import org.kafka.model.ProductQuestion;
import org.kafka.repository.ProductQuestionRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final ProductQuestionRepository questionRepository;
    private final QuestionMapper questionMapper;

    @CacheEvict(value = "product_questions", key = "#request.productId")
    public ProductQuestion askQuestion(String userId, String userFullName, QuestionRequest request) {
        ProductQuestion question = ProductQuestion.builder()
                .userId(userId)
                .userFullName(userFullName)
                .productId(request.getProductId())
                .questionText(request.getQuestionText())
                .build();

        return questionRepository.save(question);
    }

    @CacheEvict(value = "product_questions", allEntries = true)
    public ProductQuestion answerQuestion(String questionId, String adminName, AnswerRequest request) {
        ProductQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BaseDomainException(FeedbackErrorCode.QUESTION_NOT_FOUND));

        if (question.getAnswerText() != null && !question.getAnswerText().isEmpty()) {
            throw new BaseDomainException(FeedbackErrorCode.QUESTION_ALREADY_ANSWERED);
        }

        question.setAnswerText(request.getAnswerText());
        question.setAnswerDate(Instant.now());
        question.setAnsweredBy(adminName);

        return questionRepository.save(question);
    }

    @Cacheable(value = "product_questions", key = "#productId + '-' + #pageable.pageNumber")
    public Page<QuestionResponse> getQuestionsByProduct(String productId, Pageable pageable) {
        Page<ProductQuestion> questions = questionRepository.findByProductId(productId, pageable);

        List<QuestionResponse> dtoList = questions.getContent().stream()
                .map(questionMapper::toResponse)
                .toList();

        return new RestPage<>(dtoList, pageable, questions.getTotalElements());
    }

    public Page<QuestionResponse> getUnansweredQuestions(Pageable pageable) {
        Page<ProductQuestion> questions = questionRepository.findByAnswerTextIsNull(pageable);

        List<QuestionResponse> dtoList = questions.getContent().stream()
                .map(questionMapper::toResponse)
                .toList();

        return new RestPage<>(dtoList, pageable, questions.getTotalElements());
    }
}