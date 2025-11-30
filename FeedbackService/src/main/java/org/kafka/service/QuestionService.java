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
    private final QuestionMapper questionMapper; // Mapper Inject Edildi

    // Kullanıcı Soru Sorar -> Cache Temizlenmeli
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

    // Admin Cevaplar -> Cache Temizlenmeli (Cevap görünsün diye)
    // Not: Burada productId'yi parametreden değil, veritabanından bulmamız lazım.
    // CacheEvict'i burada kullanmak zor olduğu için manuel temizleme veya TTL'e güvenme yapılabilir.
    // En temiz yöntem: soruyu çektikten sonra productId'yi alıp temizlemek.
    // Şimdilik 'allEntries = true' diyerek o cache'i komple temizleyelim (Basit çözüm)
    @CacheEvict(value = "product_questions", allEntries = true)
    public ProductQuestion answerQuestion(String questionId, String adminName, AnswerRequest request) {
        ProductQuestion question = questionRepository.findById(questionId)
                // ESKİSİ: .orElseThrow(() -> new RuntimeException("Soru bulunamadı"));
                // YENİSİ:
                .orElseThrow(() -> new BaseDomainException(FeedbackErrorCode.QUESTION_NOT_FOUND));

        // Ekstra İş Kuralı: Zaten cevaplanmış mı?
        if (question.getAnswerText() != null && !question.getAnswerText().isEmpty()) {
            // Eğer update'e izin vermiyorsak hata fırlatabiliriz.
            // throw new BaseDomainException(FeedbackErrorCode.QUESTION_ALREADY_ANSWERED);
        }

        question.setAnswerText(request.getAnswerText());
        question.setAnswerDate(Instant.now());
        question.setAnsweredBy(adminName);

        return questionRepository.save(question);
    }

    // --- GÜNCELLENEN METOT ---
    // Ürün Sorularını Listele -> DTO Dönüşümü + Redis Uyumlu Sayfalama
    @Cacheable(value = "product_questions", key = "#productId + '-' + #pageable.pageNumber")
    public Page<QuestionResponse> getQuestionsByProduct(String productId, Pageable pageable) {
        Page<ProductQuestion> questions = questionRepository.findByProductId(productId, pageable);

        // Entity Listesini -> DTO Listesine Çevir
        List<QuestionResponse> dtoList = questions.getContent().stream()
                .map(questionMapper::toResponse)
                .toList();

        // RestPage ile paketle
        return new RestPage<>(dtoList, pageable, questions.getTotalElements());
    }

    // --- GÜNCELLENEN METOT 2 ---
    // Admin Paneli için bekleyen sorular
    public Page<QuestionResponse> getUnansweredQuestions(Pageable pageable) {
        Page<ProductQuestion> questions = questionRepository.findByAnswerTextIsNull(pageable);

        List<QuestionResponse> dtoList = questions.getContent().stream()
                .map(questionMapper::toResponse)
                .toList();

        return new RestPage<>(dtoList, pageable, questions.getTotalElements());
    }
}