package org.kafka.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.config.RabbitMQConfig;
import org.kafka.event.UserInteractionEvent;
import org.kafka.mapper.InteractionMapper;
import org.kafka.model.UserInteraction;
import org.kafka.repository.UserInteractionRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class InteractionListener {

    private final UserInteractionRepository repository;
    private final InteractionMapper mapper;

    @RabbitListener(queues = RabbitMQConfig.RECOMMENDATION_QUEUE)
    public void handleUserInteraction(UserInteractionEvent event) {
        log.info("📥 Event Yakalandı: User={} -> Action={} -> Product={}",
                event.getUserId(), event.getEventType(), event.getProductId());

        try {
            // DTO -> Entity Çevrimi
            UserInteraction interaction = mapper.toEntity(event);

            // MongoDB'ye Kayıt
            repository.save(interaction);

            log.info("✅ Veritabanına Kaydedildi. ID: {}", interaction.getId());

        } catch (Exception e) {
            log.error("❌ Kayıt sırasında hata oluştu: {}", e.getMessage());
            // Burada Exception fırlatmazsak mesaj RabbitMQ'dan silinir (Ack).
            // Fırlatırsak Retry mekanizması devreye girer. Şimdilik loglayıp geçiyoruz.
        }
    }
}