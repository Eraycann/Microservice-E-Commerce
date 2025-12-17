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

    // Yardımcı Metot: Kullanıcı mı Misafir mi karar ver
    private String resolveCartId(Jwt jwt, String guestId) {
        if (jwt != null) {
            return jwt.getClaimAsString("sub"); // Giriş yapmış kullanıcı ID'si
        }
        if (guestId != null && !guestId.isEmpty()) {
            return guestId; // Misafir UUID'si
        }
        throw new RuntimeException("Kimlik doğrulanamadı: Ne Token var ne de Guest-ID!");
    }

    @GetMapping
    public ResponseEntity<Cart> getCart(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestId) {

        String cartId = resolveCartId(jwt, guestId);
        return ResponseEntity.ok(cartService.getCart(cartId));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestId,
            @RequestBody CartItemRequestDto request) {

        String cartId = resolveCartId(jwt, guestId);
        return ResponseEntity.ok(cartService.addItemToCart(cartId, request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeItem(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestId,
            @PathVariable Long productId) {

        String cartId = resolveCartId(jwt, guestId);
        cartService.removeItemFromCart(cartId, productId);
        return ResponseEntity.noContent().build();
    }

    // --- YENİ: LOGIN OLUNCA ÇAĞRILACAK MERGE ENDPOINT ---
    @PostMapping("/merge")
    public ResponseEntity<Void> mergeCarts(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String guestId) {

        if (jwt == null) {
            throw new RuntimeException("Birleştirme işlemi için giriş yapmalısınız!");
        }

        // Misafir sepetini -> Kullanıcı sepetine aktar
        cartService.mergeCarts(guestId, jwt.getClaimAsString("sub"));
        return ResponseEntity.ok().build();
    }
}