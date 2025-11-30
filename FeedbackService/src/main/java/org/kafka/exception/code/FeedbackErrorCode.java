package org.kafka.exception.code;

import org.kafka.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

public enum FeedbackErrorCode implements BaseErrorCode {

    // --- Yorum Hataları (400 / 404 / 409) ---

    // Ürün yoksa yorum yapılamaz (Product Service kontrolü sonrası)
    PRODUCT_NOT_FOUND("FEEDBACK-1001", "Yorum yapılmak istenen ürün bulunamadı.", HttpStatus.NOT_FOUND),

    // Aynı kullanıcı aynı ürüne 2. kez yorum yaparsa
    REVIEW_ALREADY_EXISTS("FEEDBACK-1002", "Bu ürüne zaten yorum yaptınız. Lütfen mevcut yorumunuzu düzenleyin.", HttpStatus.CONFLICT),

    // Geçersiz puan (1-5 arası değilse)
    INVALID_RATING("FEEDBACK-1003", "Puan 1 ile 5 arasında olmalıdır.", HttpStatus.BAD_REQUEST),

    // Boş yorum
    EMPTY_COMMENT("FEEDBACK-1004", "Yorum metni boş olamaz.", HttpStatus.BAD_REQUEST),

    // --- Soru-Cevap Hataları ---

    QUESTION_NOT_FOUND("FEEDBACK-2001", "İşlem yapılmak istenen soru bulunamadı.", HttpStatus.NOT_FOUND),

    // Zaten cevaplanmış bir soruya tekrar cevap verilirse (İş kuralına göre değişir)
    QUESTION_ALREADY_ANSWERED("FEEDBACK-2002", "Bu soru zaten cevaplanmış.", HttpStatus.BAD_REQUEST),

    // --- YENİ EKLENENLER: Resim Hataları ---

    TOO_MANY_IMAGES("FEEDBACK-1005", "Bir yoruma en fazla 5 resim eklenebilir.", HttpStatus.BAD_REQUEST),

    IMAGE_UPLOAD_FAILED("FEEDBACK-5001", "Resim yüklenirken sunucu hatası oluştu.", HttpStatus.INTERNAL_SERVER_ERROR),

    INVALID_IMAGE_TYPE("FEEDBACK-1006", "Sadece resim dosyaları (jpg, png) yüklenebilir.", HttpStatus.BAD_REQUEST),

    // --- Yetki ve Genel Hatalar ---

    UNAUTHORIZED_ACTION("FEEDBACK-3001", "Bu işlemi yapmaya yetkiniz yok.", HttpStatus.FORBIDDEN),

    INTERNAL_SERVER_ERROR("FEEDBACK-9999", "Geri bildirim servisinde beklenmeyen bir hata oluştu.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus status;

    FeedbackErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

    @Override
    public String getCode() { return code; }

    @Override
    public String getMessage() { return message; }

    @Override
    public HttpStatus getStatus() { return status; }
}