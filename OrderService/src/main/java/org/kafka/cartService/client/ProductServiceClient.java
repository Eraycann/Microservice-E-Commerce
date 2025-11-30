package org.kafka.cartService.client;

import org.kafka.cartService.dto.ProductCartDetailDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service", path = "/api/v1/products")
public interface ProductServiceClient {

    @GetMapping("/{id}/cart-detail")
    ProductCartDetailDto getProductForCart(@PathVariable("id") Long id);
}