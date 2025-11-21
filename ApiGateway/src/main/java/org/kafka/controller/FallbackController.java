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
}