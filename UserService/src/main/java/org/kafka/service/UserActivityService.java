package org.kafka.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserActivityService {

    // Spring Boot'un hazır sunduğu, String işlemleri için optimize edilmiş template
    private final StringRedisTemplate redisTemplate;

    private static final String HISTORY_KEY_PREFIX = "user:history:";
    private static final int MAX_HISTORY_SIZE = 10; // Kaç ürün tutulsun?
    private static final Duration TTL = Duration.ofDays(30); // Geçmiş ne kadar saklansın?

    /**
     * Ürünü geçmişe ekler.
     * Logic: Varsa çıkar -> Başa Ekle -> Kırp -> Süre Uzat
     */
    public void addProductToHistory(String keycloakId, String productId) {
        String key = HISTORY_KEY_PREFIX + keycloakId;

        // 1. Ürün zaten listede varsa, onu listeden sil (ki en başa ekleyince duble olmasın)
        // count: 1 (ilk eşleşeni sil), value: productId
        redisTemplate.opsForList().remove(key, 1, productId);

        // 2. Ürünü listenin en başına (SOL) ekle
        redisTemplate.opsForList().leftPush(key, productId);

        // 3. Listeyi kırp (Sadece 0 ile 9. indeks arasını tut, gerisini at)
        redisTemplate.opsForList().trim(key, 0, MAX_HISTORY_SIZE - 1);

        // 4. Listenin ömrünü uzat (Her işlemde sayaç sıfırlanır)
        redisTemplate.expire(key, TTL);
    }

    /**
     * Geçmiş listesini getirir.
     */
    public List<String> getUserHistory(String keycloakId) {
        String key = HISTORY_KEY_PREFIX + keycloakId;

        // 0'dan -1'e kadar (Listenin tamamı)
        List<String> history = redisTemplate.opsForList().range(key, 0, -1);

        return history != null ? history : Collections.emptyList();
    }

    /**
     * Geçmişi temizle (Opsiyonel)
     */
    public void clearHistory(String keycloakId) {
        String key = HISTORY_KEY_PREFIX + keycloakId;
        redisTemplate.delete(key);
    }
}