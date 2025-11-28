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

    // --- YENİ EKLENEN FALLBACK ---
    @GetMapping("/recommendation")
    public Mono<String> recommendationServiceFallback() {
        // Öneri sistemi kritik bir servis değildir (Non-Critical).
        // Çökmesi durumunda ana sayfa çalışmaya devam etmelidir.
        return Mono.just("⚠️ Kişisel öneriler şu an hazırlanamıyor. Popüler ürünlere göz atabilirsiniz.");
    }
}