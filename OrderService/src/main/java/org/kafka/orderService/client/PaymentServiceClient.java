package org.kafka.orderService.client;

import org.kafka.orderService.dto.PaymentRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service", url = "http://localhost:8090")
public interface PaymentServiceClient {

    @PostMapping("/api/payments/process")
    boolean processPayment(@RequestBody PaymentRequest request);
}
// Alttaki PaymentRequest class'ını SİL, yukarıya DTO paketine taşıdık.