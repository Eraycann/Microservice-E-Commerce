package org.kafka.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.dto.PaymentRequest;
import org.kafka.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // Order Service bu ucu çağırır
    @PostMapping("/process")
    public ResponseEntity<Boolean> processPayment(@RequestBody PaymentRequest request) {
        boolean result = paymentService.processPayment(request);
        // HTTP 200 dönüyoruz ama body içinde true/false bilgisi var.
        return ResponseEntity.ok(result);
    }
}