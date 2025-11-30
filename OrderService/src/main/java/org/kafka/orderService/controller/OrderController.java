package org.kafka.orderService.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.orderService.dto.CreateOrderRequest;
import org.kafka.orderService.dto.OrderResponse;
import org.kafka.orderService.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CreateOrderRequest request) {

        // 1. JWT'den Kullanıcı Bilgilerini Al
        String userId = jwt.getClaimAsString("sub");
        String email = jwt.getClaimAsString("email");
        String fullName = jwt.getClaimAsString("name"); // "ADMİN ADMİN"

        // 2. Servise bu bilgileri ilet
        return ResponseEntity.ok(orderService.placeOrder(userId, email, fullName, request.getShippingAddress()));
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getOrders(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String userId = jwt.getClaimAsString("sub");
        return ResponseEntity.ok(orderService.getUserOrders(userId, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }
}