package org.kafka.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.config.RabbitMQConfig;
import org.kafka.event.UserInteractionEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserActivityService {

    private final StringRedisTemplate redisTemplate;
    private final RabbitTemplate rabbitTemplate; // Inject ettik

    private static final String HISTORY_KEY_PREFIX = "user:history:";
    private static final int MAX_HISTORY_SIZE = 10;
    private static final Duration TTL = Duration.ofDays(30);

    /**
     * Hem Redis'i günceller hem de Recommendation Service'e haber uçurur.
     */
    public void addProductToHistory(String keycloakId, String productId) {
        // --- 1. REDIS İŞLEMİ (UI İÇİN - SENKRON) ---
        String key = HISTORY_KEY_PREFIX + keycloakId;
        redisTemplate.opsForList().remove(key, 1, productId);
        redisTemplate.opsForList().leftPush(key, productId);
        redisTemplate.opsForList().trim(key, 0, MAX_HISTORY_SIZE - 1);
        redisTemplate.expire(key, TTL);

        // --- 2. RABBITMQ İŞLEMİ (AI İÇİN - ASENKRON/FIRE-AND-FORGET) ---
        // Burada hata olursa kullanıcıyı bekletmemeli veya işlemi durdurmamalıyız.
        try {
            UserInteractionEvent event = new UserInteractionEvent(
                    keycloakId,
                    productId,
                    "VIEW", // Olay Tipi: Görüntüleme
                    System.currentTimeMillis()
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ACTIVITY_EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_VIEW,
                    event
            );

            log.debug("👀 VIEW Event fırlatıldı: User={}, Product={}", keycloakId, productId);

        } catch (Exception e) {
            log.error("❌ Recommendation event hatası: {}", e.getMessage());
            // Exception'ı yutuyoruz, çünkü bu loglama ana akışı (Redis kaydını) bozmamalı.
        }
    }

    public List<String> getUserHistory(String keycloakId) {
        String key = HISTORY_KEY_PREFIX + keycloakId;
        List<String> history = redisTemplate.opsForList().range(key, 0, -1);
        return history != null ? history : Collections.emptyList();
    }

    public void clearHistory(String keycloakId) {
        String key = HISTORY_KEY_PREFIX + keycloakId;
        redisTemplate.delete(key);
    }
}