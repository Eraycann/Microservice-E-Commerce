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

    public void publishAddToCartEvent(String userId, String productId) {
        try {
            UserInteractionEvent event = new UserInteractionEvent(
                    userId,
                    productId,
                    "ADD_TO_CART", // Olay Tipi
                    System.currentTimeMillis()
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ACTIVITY_EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_CART_ADD,
                    event
            );

            log.info("🛒 Sepet olayı fırlatıldı: User={}, Product={}", userId, productId);

        } catch (Exception e) {
            // Sepet işlemini durdurma, sadece logla (Fire-and-Forget)
            log.error("❌ RabbitMQ Hatası: {}", e.getMessage());
        }
    }
}