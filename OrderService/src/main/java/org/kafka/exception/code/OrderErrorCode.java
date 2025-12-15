package org.kafka.exception.code;

import org.kafka.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

public enum OrderErrorCode implements BaseErrorCode {

    // --- Kullanıcı Kaynaklı Hatalar (400 Bad Request) ---

    EMPTY_CART("ORDER-1001", "Sepetiniz boş olduğu için sipariş oluşturulamaz.", HttpStatus.BAD_REQUEST),

    // --- Ödeme Hataları (402 Payment Required veya 400) ---

    PAYMENT_FAILED("ORDER-2001", "Ödeme işlemi başarısız oldu. Lütfen kart bilgilerinizi kontrol edin.", HttpStatus.PAYMENT_REQUIRED),

    // --- Stok ve Ürün Hataları (409 Conflict veya 400) ---

    INSUFFICIENT_STOCK("ORDER-3001", "Ürünlerden bazılarında stok yetersiz. Sipariş oluşturulamadı.", HttpStatus.CONFLICT),

    // --- Genel Sistem Hataları (500 Internal Server Error) ---

    ORDER_CREATION_FAILED("ORDER-5001", "Sipariş oluşturulurken sistemsel bir hata meydana geldi.", HttpStatus.INTERNAL_SERVER_ERROR),
    ROLLBACK_FAILED("ORDER-5002", "Sipariş iptal edildi ancak stok iadesinde hata oluştu. Lütfen müşteri hizmetleri ile iletişime geçin.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus status;

    OrderErrorCode(String code, String message, HttpStatus status) {
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