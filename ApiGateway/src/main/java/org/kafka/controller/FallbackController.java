package org.kafka.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/product")
    public Mono<String> productServiceFallback() {
        return Mono.just("⚠️ Ürün Servisi şu an yanıt veremiyor. Lütfen daha sonra tekrar deneyiniz. (Circuit Breaker Activated)");
    }

    @GetMapping("/user")
    public Mono<String> userServiceFallback() {
        return Mono.just("⚠️ Kullanıcı Servisi bakımda veya aşırı yoğun. (Circuit Breaker Activated)");
    }

    @GetMapping("/recommendation")
    public Mono<String> recommendationServiceFallback() {
        return Mono.just("⚠️ Kişisel öneriler şu an hazırlanamıyor. Popüler ürünlere göz atabilirsiniz.");
    }

    @GetMapping("/order")
    public Mono<String> orderServiceFallback() {
        return Mono.just("⚠️ Sipariş Servisi şu an yanıt veremiyor. Lütfen daha sonra tekrar deneyiniz.");
    }

    // --- YENİ EKLENENLER ---

    @GetMapping("/payment")
    public Mono<String> paymentServiceFallback() {
        return Mono.just("⚠️ Ödeme Servisi geçici olarak hizmet dışıdır. Lütfen daha sonra tekrar deneyiniz.");
    }

    @GetMapping("/notification")
    public Mono<String> notificationServiceFallback() {
        // Bildirim servisi kritik değildir, kullanıcıya hata göstermek yerine loglanabilir veya boş dönülebilir.
        return Mono.just("⚠️ Bildirim tercihleri şu an yüklenemiyor.");
    }

    @GetMapping("/feedback")
    public Mono<String> feedbackServiceFallback() {
        return Mono.just("⚠️ Değerlendirme sistemi şu an yanıt veremiyor.");
    }
}