package org.kafka.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishUserCreatedEvent(UserCreatedEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_USER_CREATED,
                    event
            );
            log.info("🐇 RabbitMQ Olayı Başarıyla Fırlatıldı: {}", event.email());
        } catch (Exception e) {
            // Hata olsa bile ana akışı bozmamak için sadece logluyoruz.
            // İleride buraya "Retry" (Tekrar deneme) mekanizması eklenebilir.
            log.error("❌ RabbitMQ Mesaj Gönderim Hatası: {}", e.getMessage());
        }
    }
}