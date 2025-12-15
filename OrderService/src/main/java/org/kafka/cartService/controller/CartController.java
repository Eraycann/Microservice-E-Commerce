package org.kafka.cartService.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.cartService.dto.CartItemRequestDto;
import org.kafka.cartService.model.Cart;
import org.kafka.cartService.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;


    @GetMapping
    public ResponseEntity<Cart> getCart(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(cartService.getCart(jwt.getClaimAsString("sub")));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(@AuthenticationPrincipal Jwt jwt, @RequestBody CartItemRequestDto request) {
        return ResponseEntity.ok(cartService.addItemToCart(jwt.getClaimAsString("sub"), request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeItem(@AuthenticationPrincipal Jwt jwt, @PathVariable Long productId) {
        cartService.removeItemFromCart(jwt.getClaimAsString("sub"), productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal Jwt jwt) {
        cartService.clearCart(jwt.getClaimAsString("sub"));
        return ResponseEntity.noContent().build();
    }
}
