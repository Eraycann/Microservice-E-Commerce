package org.kafka.client; // Ortak paket

import org.kafka.cartService.dto.ProductCartDetailDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "product-service")
public interface ProductServiceClient {

    // Cart için gerekli metod
    @GetMapping("/api/v1/products/{id}/cart-detail")
    ProductCartDetailDto getProductForCart(@PathVariable("id") Long id);

    // Order için gerekli metodlar
    @PostMapping("/api/products/{id}/reduce-stock")
    void reduceStock(@PathVariable("id") String productId, @RequestParam int quantity);

    @PostMapping("/api/products/{id}/restore-stock")
    void restoreStock(@PathVariable("id") String productId, @RequestParam int quantity);
}