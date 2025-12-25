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
    private final RabbitTemplate rabbitTemplate;

    private static final String HISTORY_KEY_PREFIX = "user:history:";
    private static final int MAX_HISTORY_SIZE = 10;
    private static final Duration TTL = Duration.ofDays(30);

    /**
     * Kullanıcının baktığı ürünleri kaydeder.
     * 1. Redis: Sadece login olmuş kullanıcılar için "Son Gezilenler" listesini günceller.
     * 2. RabbitMQ: Hem login hem guest kullanıcılar için Recommendation servisine veri atar.
     *
     * @param userId  Keycloak ID (Login ise dolu, değilse null)
     * @param guestId Misafir ID (Header'dan gelir)
     * @param productId Ürün ID
     */
    public void addProductToHistory(String userId, String guestId, String productId) {

        // --- 1. REDIS İŞLEMİ (UI İÇİN - SENKRON) ---
        // Sadece login olmuş kullanıcılar için UI geçmişi tutuyoruz.
        if (userId != null) {
            String key = HISTORY_KEY_PREFIX + userId;
            redisTemplate.opsForList().remove(key, 1, productId); // Varsa eskisini sil (üste taşımak için)
            redisTemplate.opsForList().leftPush(key, productId);  // En başa ekle
            redisTemplate.opsForList().trim(key, 0, MAX_HISTORY_SIZE - 1); // Boyutu koru
            redisTemplate.expire(key, TTL);
        }

        // --- 2. RABBITMQ İŞLEMİ (AI İÇİN - ASENKRON/FIRE-AND-FORGET) ---
        // Misafir verisi de model eğitimi için kritiktir. userId null olsa bile gönderiyoruz.
        try {
            UserInteractionEvent event = new UserInteractionEvent(
                    userId,     // Login değilse null gidebilir
                    guestId,    // Misafir ID (Login olsa bile front-end gönderebilir)
                    productId,
                    "VIEW",     // Olay Tipi: Görüntüleme
                    System.currentTimeMillis()
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ACTIVITY_EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_VIEW,
                    event
            );

            log.debug("👀 VIEW Event fırlatıldı: User={}, Guest={}, Product={}", userId, guestId, productId);

        } catch (Exception e) {
            log.error("❌ Recommendation event hatası: {}", e.getMessage());
            // Exception'ı yutuyoruz, çünkü bu loglama ana akışı (Redis/Response) bozmamalı.
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