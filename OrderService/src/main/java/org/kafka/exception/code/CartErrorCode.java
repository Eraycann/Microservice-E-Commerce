package org.kafka.exception.code;

import org.kafka.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

/**
 * Cart Service domainine ait tüm hata kodlarını (Sepet, Sepet Öğesi, İletişim vb.) içerir.
 */
public enum CartErrorCode implements BaseErrorCode {

    // --- Sepet Hataları (400 / 404) ---

    CART_ITEM_NOT_FOUND("CART-1001", "Sepette istenen ürün bulunamadı.", HttpStatus.NOT_FOUND),
    INVALID_CART_QUANTITY("CART-1002", "Sepete eklenmek istenen miktar geçerli değil (örn: negatif veya sıfır).", HttpStatus.BAD_REQUEST),
    PRODUCT_QUANTITY_EXCEEDS_MAX("CART-1003", "Sepetteki ürün miktarı izin verilen maksimum adedi aşıyor.", HttpStatus.BAD_REQUEST),

    // --- Product Service İletişim Hataları (5xx ve Özel 4xx) ---

    // Bu, Feign Client'ın ProductService'e ulaştığı ancak Product Service'in 404 döndüğü durumdur.
    PRODUCT_SERVICE_PRODUCT_NOT_FOUND("CART-2001", "Sepete eklenmek istenen ürün, ürün servisinde bulunamadı.", HttpStatus.NOT_FOUND),

    // Bu, Feign Client'ın ProductService'ten yetersiz stok cevabı alması durumudur.
    PRODUCT_SERVICE_INSUFFICIENT_STOCK("CART-2002", "Ürün servisi yeterli stok olmadığını bildirdi.", HttpStatus.BAD_REQUEST),

    // Feign Client üzerinden Product Service'e ulaşılamaması veya genel iletişim hatası
    PRODUCT_SERVICE_COMMUNICATION_ERROR("CART-2003", "Ürün servisi ile iletişim kurulamadı.", HttpStatus.INTERNAL_SERVER_ERROR),

    // --- Genel Hatalar (5xx) ---

    INTERNAL_SERVER_ERROR("CART-9999", "Sepet servisinde bilinmeyen dahili bir hata oluştu.", HttpStatus.INTERNAL_SERVER_ERROR);


    private final String code;
    private final String message;
    private final HttpStatus status;


    CartErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }

    @Override
    public HttpStatus getStatus() {
        return status;
    }
}
