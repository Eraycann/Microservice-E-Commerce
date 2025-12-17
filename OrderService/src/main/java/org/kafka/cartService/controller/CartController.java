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

    /**
     * Yardımcı Metot: Redis Key'ini belirler.
     * Service katmanındaki "addItemToCart" mantığıyla aynı olmalıdır.
     * Login ise -> "user-id"
     * Misafir ise -> "guest:guest-id"
     */
    private String getTargetCartId(Jwt jwt, String guestId) {
        if (jwt != null) {
            return jwt.getClaimAsString("sub");
        }
        if (guestId != null && !guestId.isEmpty()) {
            return "guest:" + guestId; // Service'teki kayıt formatına uyması için prefix ekledik
        }
        throw new RuntimeException("Kimlik doğrulanamadı: Ne Token var ne de Guest-ID!");
    }

    @GetMapping
    public ResponseEntity<Cart> getCart(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestId) {

        // Redis'ten okurken doğru key formatını oluşturuyoruz
        String cartId = getTargetCartId(jwt, guestId);
        return ResponseEntity.ok(cartService.getCart(cartId));
    }

    // --- HATANIN ÇÖZÜLDÜĞÜ YER ---
    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestId,
            @RequestBody CartItemRequestDto request) {

        // UserId'yi JWT'den güvenli şekilde al (Yoksa null)
        String userId = (jwt != null) ? jwt.getClaimAsString("sub") : null;

        // Servis katmanına ARTIK 3 PARAMETRE gönderiyoruz.
        // Servis; hem Redis kaydını hem de RabbitMQ event'ini buna göre ayarlayacak.
        return ResponseEntity.ok(cartService.addItemToCart(userId, guestId, request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeItem(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestId,
            @PathVariable Long productId) {

        // Silme işlemi için doğru Redis Key'ini bul
        String cartId = getTargetCartId(jwt, guestId);
        cartService.removeItemFromCart(cartId, productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestId) {

        String cartId = getTargetCartId(jwt, guestId);
        cartService.clearCart(cartId);
        return ResponseEntity.noContent().build();
    }

    // --- LOGIN OLUNCA ÇAĞRILACAK MERGE ENDPOINT ---
    @PostMapping("/merge")
    public ResponseEntity<Void> mergeCarts(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String guestId) {

        if (jwt == null) {
            throw new RuntimeException("Birleştirme işlemi için giriş yapmalısınız!");
        }

        // Misafir sepeti ID'si "guest:" ile başlar
        String guestCartKey = "guest:" + guestId;
        String userCartKey = jwt.getClaimAsString("sub");

        cartService.mergeCarts(guestCartKey, userCartKey);
        return ResponseEntity.ok().build();
    }
}