package org.kafka.client;

import org.kafka.dto.ProductDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

// "product-service" Eureka'daki isimdir
@FeignClient(name = "product-service")
public interface ProductServiceClient {

    // Örn: GET /api/products/ids?ids=1,2,3
    @GetMapping("/api/products/ids")
    List<ProductDto> getProductsByIds(@RequestParam("ids") List<String> ids);
}