package org.kafka.exception.code;

import org.kafka.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

/**
 * Product Service domainine ait tüm hata kodlarını (Ürün, Kategori, Stok vb.) içerir.
 */
public enum ProductErrorCode implements BaseErrorCode {

    // --- Product Hataları (404 Not Found / 409 Conflict) ---

    PRODUCT_NOT_FOUND("PROD-1001", "İstenen ürün bulunamadı.", HttpStatus.NOT_FOUND),
    PRODUCT_SLUG_ALREADY_EXISTS("PROD-1002", "Belirtilen ürün adı zaten mevcut (Slug çakışması).", HttpStatus.CONFLICT),

    // --- Kategori ve Marka Hataları ---

    CATEGORY_NOT_FOUND("PROD-1003", "Kategori bulunamadı.", HttpStatus.NOT_FOUND),
    BRAND_NOT_FOUND("PROD-1004", "Marka bulunamadı.", HttpStatus.NOT_FOUND),
    CATEGORY_HAS_ACTIVE_PRODUCTS("PROD-1005", "Bu kategoriye bağlı aktif ürünler olduğu için silinemez.", HttpStatus.BAD_REQUEST),

    // --- Stok ve Envanter Hataları (Order/Inventory İlişkisi) ---

    INSUFFICIENT_STOCK("PROD-1006", "İstenen miktarda yeterli stok mevcut değil.", HttpStatus.BAD_REQUEST),
    INVENTORY_NOT_FOUND("PROD-1007", "Ürüne ait envanter kaydı bulunamadı.", HttpStatus.NOT_FOUND),
    INVALID_STOCK_ADJUSTMENT("PROD-1008", "Stok miktarı geçersiz değer içeriyor.", HttpStatus.BAD_REQUEST),

    // --- Dinamik Özellik (Spec) Hataları ---

    SPEC_DATA_INVALID_FORMAT("PROD-1009", "Teknik özellik verisi (JSONB) geçersiz formattadır.", HttpStatus.BAD_REQUEST),

    // --- Genel Hatalar (5xx) ---

    INTERNAL_SERVER_ERROR("PROD-9999", "Ürün servisinde bilinmeyen dahili bir hata oluştu.", HttpStatus.INTERNAL_SERVER_ERROR);


    private final String code;
    private final String message;
    private final HttpStatus status;


    ProductErrorCode(String code, String message, HttpStatus status) {
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
