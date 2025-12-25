package org.kafka.cartService.service;

import lombok.RequiredArgsConstructor;
import org.kafka.client.ProductServiceClient;
import org.kafka.cartService.dto.ProductCartDetailDto;
import org.kafka.cartService.event.CartEventPublisher;
import org.kafka.cartService.model.Cart;
import org.kafka.cartService.model.CartItem;
import org.kafka.cartService.repository.CartRepository;
import org.kafka.cartService.dto.CartItemRequestDto;
import org.kafka.exception.code.CartErrorCode;
import org.kafka.exception.base.BaseDomainException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductServiceClient productServiceClient;
    private final CartEventPublisher cartEventPublisher;

    private static final int MAX_ITEM_QUANTITY = 99;

    /**
     * Redis Key'ini kullanarak sepeti getirir.
     * key: "user-uuid" veya "guest:guest-uuid" olabilir.
     */
    public Cart getCart(String key) {
        return cartRepository.findByUserId(key)
                .orElseGet(() -> Cart.builder()
                        .userId(key)
                        .items(new ArrayList<>())
                        .totalCartPrice(BigDecimal.ZERO)
                        .build());
    }

    /**
     * Sepete ürün ekler.
     * Hem Login olmuş (userId) hem Misafir (guestId) durumunu yönetir.
     */
    public Cart addItemToCart(String userId, String guestId, CartItemRequestDto request) {
        // 0. Miktar Geçerliliği Kontrolü
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BaseDomainException(CartErrorCode.INVALID_CART_QUANTITY);
        }

        // 1. Redis Key Belirleme (Target ID)
        // Eğer login ise ID'yi kullan, değilse "guest:" prefix'i ile guestId kullan.
        String targetCartId = (userId != null) ? userId : "guest:" + guestId;

        // 2. Mevcut sepeti çek veya yeni oluştur
        Cart cart = getCart(targetCartId);

        // 3. ProductService'ten güncel veriyi (Snapshot) al
        ProductCartDetailDto productDto;
        try {
            productDto = productServiceClient.getProductForCart(request.getProductId());
        } catch (Exception e) {
            throw new BaseDomainException(CartErrorCode.PRODUCT_SERVICE_COMMUNICATION_ERROR);
        }

        // 4. Stok Kontrolü
        if (productDto.getStockCount() < request.getQuantity()) {
            throw new BaseDomainException(CartErrorCode.PRODUCT_SERVICE_INSUFFICIENT_STOCK);
        }

        // 5. Ürün sepette zaten var mı?
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productDto.getId()))
                .findFirst();

        int finalQuantity;

        if (existingItem.isPresent()) {
            // Varsa güncelle
            CartItem item = existingItem.get();
            finalQuantity = item.getQuantity() + request.getQuantity();

            if (finalQuantity > MAX_ITEM_QUANTITY) {
                throw new BaseDomainException(CartErrorCode.PRODUCT_QUANTITY_EXCEEDS_MAX);
            }

            item.setQuantity(finalQuantity);
            item.setPrice(productDto.getPrice());
            item.setTotalItemPrice(item.getPrice().multiply(BigDecimal.valueOf(finalQuantity)));
        } else {
            // Yoksa ekle
            finalQuantity = request.getQuantity();
            if (finalQuantity > MAX_ITEM_QUANTITY) {
                throw new BaseDomainException(CartErrorCode.PRODUCT_QUANTITY_EXCEEDS_MAX);
            }

            CartItem newItem = CartItem.builder()
                    .productId(productDto.getId())
                    .productName(productDto.getName())
                    .productSlug(productDto.getSlug())
                    .imageUrl(productDto.getMainImageUrl())
                    .quantity(finalQuantity)
                    .price(productDto.getPrice())
                    .totalItemPrice(productDto.getPrice().multiply(BigDecimal.valueOf(finalQuantity)))
                    .build();
            cart.getItems().add(newItem);
        }

        // 6. Hesapla ve Kaydet
        calculateCartTotal(cart);
        cartRepository.save(cart);

        // --- DÜZELTME: RECOMMENDATION SERVICE HABERLEŞMESİ ---
        // Artık hem userId hem guestId gönderiyoruz. Publisher bunu bekliyor.
        cartEventPublisher.publishAddToCartEvent(
                userId,
                guestId,
                String.valueOf(request.getProductId())
        );

        return cart;
    }

    public void removeItemFromCart(String cartId, Long productId) {
        Cart cart = getCart(cartId);

        boolean removed = cart.getItems().removeIf(item -> item.getProductId().equals(productId));

        if (!removed) {
            throw new BaseDomainException(CartErrorCode.CART_ITEM_NOT_FOUND);
        }

        calculateCartTotal(cart);
        cartRepository.save(cart);
    }

    public void clearCart(String cartId) {
        cartRepository.delete(cartId);
    }

    private void calculateCartTotal(Cart cart) {
        BigDecimal total = cart.getItems().stream()
                .map(CartItem::getTotalItemPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalCartPrice(total);
    }

    public void mergeCarts(String guestCartId, String userCartId) {
        // 1. Misafir sepetini bul (Redis Key: "guest:UUID")
        Optional<Cart> guestCartOpt = cartRepository.findByUserId(guestCartId);

        if (guestCartOpt.isEmpty() || guestCartOpt.get().getItems().isEmpty()) {
            // Sepet boş olsa bile, Recommendation tarafında "Geçmişi Birleştir" demek isteyebiliriz.
            // Ama genelde sepet boşsa kullanıcı hiçbir şey yapmamış demektir, pas geçebiliriz.
            // İsteğe bağlı olarak event fırlatmayı dışarı alabilirsin.
            return;
        }

        Cart guestCart = guestCartOpt.get();

        // 2. Birleştirme (Sepet Ürünleri)
        for (CartItem guestItem : guestCart.getItems()) {
            CartItemRequestDto requestDto = new CartItemRequestDto();
            requestDto.setProductId(guestItem.getProductId());
            requestDto.setQuantity(guestItem.getQuantity());

            try {
                // Sepete eklerken guestId = null gönderiyoruz, çünkü hedef User.
                addItemToCart(userCartId, null, requestDto);
            } catch (Exception e) {
                System.err.println("Merge sırasında ürün eklenemedi: " + guestItem.getProductId());
            }
        }

        // 3. Misafir sepetini Redis'ten sil
        cartRepository.delete(guestCartId);

        // 4. RECOMMENDATION SERVICE'E HABER VER (YENİ)
        // guestCartId "guest:550e..." şeklinde geliyor. Prefix'i temizleyip gönderiyoruz.
        String rawGuestId = guestCartId.replace("guest:", "");

        cartEventPublisher.publishMergeEvent(rawGuestId, userCartId);
    }
}