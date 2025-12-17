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
    private final CartEventPublisher cartEventPublisher; // Inject Edildi

    private static final int MAX_ITEM_QUANTITY = 99;

    public Cart getCart(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> Cart.builder()
                        .userId(userId)
                        .items(new ArrayList<>())
                        .totalCartPrice(BigDecimal.ZERO)
                        .build());
    }

    public Cart addItemToCart(String userId, CartItemRequestDto request) {
        // 0. Miktar Geçerliliği Kontrolü (CART-1002)
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BaseDomainException(CartErrorCode.INVALID_CART_QUANTITY);
        }

        // 1. Mevcut sepeti çek veya yeni oluştur
        Cart cart = getCart(userId);

        // 2. ProductService'ten güncel veriyi (Snapshot) al
        // NOT: Feign Client'ta, eğer ProductService 404 dönerse, bu hatayı yakalayıp
        // CART-2001'e dönüştürecek bir ErrorDecoder'ınız olmalıdır.
        ProductCartDetailDto productDto;
        try {
            productDto = productServiceClient.getProductForCart(request.getProductId());
        } catch (Exception e) {
            // Eğer Feign, ProductService'e ulaşamazsa veya 5xx hatası alırsa
            throw new BaseDomainException(CartErrorCode.PRODUCT_SERVICE_COMMUNICATION_ERROR);
        }

        // 3. Stok Kontrolü (Basit) (CART-2002)
        if (productDto.getStockCount() < request.getQuantity()) {
            // Yetersiz stok uyarısı
            throw new BaseDomainException(CartErrorCode.PRODUCT_SERVICE_INSUFFICIENT_STOCK);
        }

        // 4. Ürün sepette zaten var mı?
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productDto.getId()))
                .findFirst();

        int finalQuantity;

        if (existingItem.isPresent()) {
            // Varsa miktarını artır
            CartItem item = existingItem.get();
            finalQuantity = item.getQuantity() + request.getQuantity();

            // Maksimum miktar kontrolü (CART-1003)
            if (finalQuantity > MAX_ITEM_QUANTITY) {
                throw new BaseDomainException(CartErrorCode.PRODUCT_QUANTITY_EXCEEDS_MAX);
            }

            // Güncelleme
            item.setQuantity(finalQuantity);
            item.setPrice(productDto.getPrice()); // Fiyat güncellemesi
            item.setTotalItemPrice(item.getPrice().multiply(BigDecimal.valueOf(finalQuantity)));
        } else {
            // Yoksa yeni item oluştur
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
                    .price(productDto.getPrice()) // SNAPSHOT ALINIYOR
                    .totalItemPrice(productDto.getPrice().multiply(BigDecimal.valueOf(finalQuantity)))
                    .build();
            cart.getItems().add(newItem);
        }

        // 5. Sepet Toplamını Yeniden Hesapla
        calculateCartTotal(cart);

        // 6. Redis'e Kaydet
        cartRepository.save(cart);

        // --- YENİ: RECOMMENDATION SERVICE'E HABER VER ---
        // Ürün ID'si Long ise String'e çeviriyoruz
        cartEventPublisher.publishAddToCartEvent(userId, String.valueOf(request.getProductId()));

        return cart;
    }

    public void removeItemFromCart(String userId, Long productId) {
        Cart cart = getCart(userId);

        boolean removed = cart.getItems().removeIf(item -> item.getProductId().equals(productId));

        // Sepet öğesi bulunamazsa hata fırlat (CART-1001)
        if (!removed) {
            throw new BaseDomainException(CartErrorCode.CART_ITEM_NOT_FOUND);
        }

        calculateCartTotal(cart);
        cartRepository.save(cart);
    }

    public void clearCart(String userId) {
        cartRepository.delete(userId);
    }

    private void calculateCartTotal(Cart cart) {
        BigDecimal total = cart.getItems().stream()
                .map(CartItem::getTotalItemPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalCartPrice(total);
    }

    public void mergeCarts(String guestCartId, String userCartId) {
        // 1. Misafir sepetini bul
        Optional<Cart> guestCartOpt = cartRepository.findByUserId(guestCartId);

        if (guestCartOpt.isEmpty() || guestCartOpt.get().getItems().isEmpty()) {
            return; // Birleştirilecek bir şey yok
        }

        Cart guestCart = guestCartOpt.get();

        // 2. Misafir sepetindeki her ürünü, sanki kullanıcı yeni ekliyormuş gibi ekle.
        // Bu sayede "addItemToCart" içindeki stok kontrolü, fiyat güncellemesi ve miktar artırma (x + y)
        // mantıklarını tekrar yazmamıza gerek kalmaz.
        for (CartItem guestItem : guestCart.getItems()) {
            CartItemRequestDto requestDto = new CartItemRequestDto();
            requestDto.setProductId(guestItem.getProductId());
            requestDto.setQuantity(guestItem.getQuantity());

            try {
                addItemToCart(userCartId, requestDto);
            } catch (Exception e) {
                // Stok yetersizse veya ürün artık yoksa, o ürünü atla ama işlemi durdurma.
                // Log basılabilir.
                System.err.println("Merge sırasında ürün eklenemedi: " + guestItem.getProductId());
            }
        }

        // 3. Misafir sepetini sil (Artık birleşti)
        cartRepository.delete(guestCartId);
    }
}