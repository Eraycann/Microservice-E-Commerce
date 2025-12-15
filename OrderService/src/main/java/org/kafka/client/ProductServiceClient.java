package org.kafka.client; // Ortak paket

import org.kafka.cartService.dto.ProductCartDetailDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "product-service")
public interface ProductServiceClient {

    // Cart için gerekli metod (Burası ProductController'da, stock controller'da değil)
    @GetMapping("/api/v1/products/{id}/cart-detail")
    ProductCartDetailDto getProductForCart(@PathVariable("id") Long id);

    // --- Order için gerekli metodlar (STOK İŞLEMLERİ) ---

    // Düzeltme: URL'e "/stock" eklendi
    // Hedef: POST /api/v1/products/{id}/stock/reduce-stock
    @PostMapping("/api/v1/products/{id}/stock/reduce-stock")
    void reduceStock(@PathVariable("id") String productId, @RequestParam int quantity);

    // Düzeltme: URL'e "/stock" eklendi
    // Hedef: POST /api/v1/products/{id}/stock/restore-stock
    @PostMapping("/api/v1/products/{id}/stock/restore-stock")
    void restoreStock(@PathVariable("id") String productId, @RequestParam int quantity);
}