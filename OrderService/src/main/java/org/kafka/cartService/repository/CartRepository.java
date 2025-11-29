package org.kafka.cartService.repository;

import lombok.RequiredArgsConstructor;
import org.kafka.cartService.model.Cart;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CartRepository {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String KEY_PREFIX = "cart:";
    private static final Duration CART_TTL = Duration.ofDays(30); // Sepet 30 gün saklanır

    public void save(Cart cart) {
        String key = KEY_PREFIX + cart.getUserId();
        redisTemplate.opsForValue().set(key, cart, CART_TTL);
    }

    public Optional<Cart> findByUserId(String userId) {
        String key = KEY_PREFIX + userId;
        Cart cart = (Cart) redisTemplate.opsForValue().get(key);
        return Optional.ofNullable(cart);
    }

    public void delete(String userId) {
        String key = KEY_PREFIX + userId;
        redisTemplate.delete(key);
    }
}
