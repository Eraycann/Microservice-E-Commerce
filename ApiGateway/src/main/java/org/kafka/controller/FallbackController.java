package org.kafka.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    // 1. PRODUCT
    @GetMapping("/product")
    public Mono<ResponseEntity<String>> productServiceFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("⚠️ Ürün Servisi şu an yanıt veremiyor. Lütfen daha sonra tekrar deneyiniz."));
    }

    // 2. USER
    @GetMapping("/user")
    public Mono<ResponseEntity<String>> userServiceFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("⚠️ Kullanıcı Servisi bakımda. Profil işlemlerini şu an gerçekleştiremiyoruz."));
    }

    // 3. SEARCH
    @GetMapping("/search")
    public Mono<ResponseEntity<String>> searchServiceFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("⚠️ Arama motoru geçici olarak devre dışı. Lütfen kategorileri kullanın."));
    }

    // 4. ORDER
    @GetMapping("/order")
    public Mono<ResponseEntity<String>> orderServiceFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("⚠️ Sipariş oluşturma servisi yoğunluk nedeniyle cevap veremiyor."));
    }

    // 5. PAYMENT
    @GetMapping("/payment")
    public Mono<ResponseEntity<String>> paymentServiceFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("⚠️ Ödeme sistemi şu an kullanılamıyor."));
    }

    // 6. RECOMMENDATION
    @GetMapping("/recommendation")
    public Mono<ResponseEntity<String>> recommendationServiceFallback() {
        // Öneri servisi kritik değildir, 200 OK dönüp boş liste veya varsayılan mesaj verebiliriz.
        // Ama şimdilik hata mesajı dönelim.
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("⚠️ Size özel öneriler şu an hazırlanamıyor."));
    }

    // 7. NOTIFICATION
    @GetMapping("/notification")
    public Mono<ResponseEntity<String>> notificationServiceFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("⚠️ Bildirim ayarları yüklenemedi."));
    }

    // 8. FEEDBACK
    @GetMapping("/feedback")
    public Mono<ResponseEntity<String>> feedbackServiceFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("⚠️ Değerlendirme ve yorumlar şu an görüntülenemiyor."));
    }
}