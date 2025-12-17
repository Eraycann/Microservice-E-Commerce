package org.kafka.cartService.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CartEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Sepete ürün eklendiğinde tetiklenir.
     * Hem Login olmuş (userId) hem de Misafir (guestId) kullanıcıları destekler.
     */
    public void publishAddToCartEvent(String userId, String guestId, String productId) {
        try {
            // UserInteractionEvent constructor sırası: userId, guestId, productId, type, timestamp
            UserInteractionEvent event = new UserInteractionEvent(
                    userId,         // Login değilse null olabilir
                    guestId,        // Misafir ID (Header'dan gelir)
                    productId,
                    "ADD_TO_CART",  // Olay Tipi
                    System.currentTimeMillis()
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ACTIVITY_EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_CART_ADD, // "interaction.cart.add"
                    event
            );

            log.info("🛒 Sepet olayı fırlatıldı: User={}, Guest={}, Product={}", userId, guestId, productId);

        } catch (Exception e) {
            // Sepet işlemini durdurma, sadece logla (Fire-and-Forget)
            // RabbitMQ çökse bile kullanıcı ürünü sepete ekleyebilmeli.
            log.error("❌ RabbitMQ Hatası (Cart Event): {}", e.getMessage());
        }
    }

    // --- YENİ EKLENEN METOD ---
    public void publishMergeEvent(String guestId, String userId) {
        try {
            UserMergeEvent event = new UserMergeEvent(
                    guestId,
                    userId,
                    System.currentTimeMillis()
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ACTIVITY_EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_USER_MERGE, // "interaction.user.merge"
                    event
            );

            log.info("🔗 Merge Event fırlatıldı: Guest={} -> User={}", guestId, userId);

        } catch (Exception e) {
            log.error("❌ RabbitMQ Merge Hatası: {}", e.getMessage());
        }
    }
}