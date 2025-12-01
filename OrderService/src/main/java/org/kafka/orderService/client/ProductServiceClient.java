package org.kafka.orderService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service")
public interface ProductServiceClient {

    // Stok Düş (Stock < Quantity ise 400 döner)
    @PostMapping("/api/products/{id}/reduce-stock")
    void reduceStock(@PathVariable("id") String productId, @RequestParam int quantity);

    // Stok İade Et (Rollback senaryosu için)
    @PostMapping("/api/products/{id}/restore-stock")
    void restoreStock(@PathVariable("id") String productId, @RequestParam int quantity);
}