package org.kafka.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.config.RabbitMQConfig;
import org.kafka.event.UserInteractionEvent;
import org.kafka.event.UserMergeEvent;
import org.kafka.mapper.InteractionMapper;
import org.kafka.model.UserInteraction;
import org.kafka.repository.UserInteractionRepository;
import org.kafka.service.RecommendationService;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RabbitListener(queues = RabbitMQConfig.RECOMMENDATION_QUEUE) // Kuyruğu sınıf seviyesinde dinle
@RequiredArgsConstructor
@Slf4j
public class InteractionListener {

    private final UserInteractionRepository repository;
    private final InteractionMapper mapper;
    private final RecommendationService recommendationService;

    // 1. Etkileşim Yakalama (VIEW, CART, PURCHASE)
    @RabbitHandler
    public void handleUserInteraction(UserInteractionEvent event) {
        log.info("📥 Interaction: User={}, Guest={}, Action={}",
                event.getUserId(), event.getGuestId(), event.getEventType());

        try {
            UserInteraction interaction = mapper.toEntity(event);
            repository.save(interaction);
        } catch (Exception e) {
            log.error("❌ Kayıt hatası: {}", e.getMessage());
        }
    }

    // 2. Birleştirme Yakalama (MERGE)
    @RabbitHandler
    public void handleUserMerge(UserMergeEvent event) {
        log.info("📥 Merge Event: Guest({}) -> User({})", event.getGuestId(), event.getUserId());

        try {
            recommendationService.mergeGuestData(event.getGuestId(), event.getUserId());
        } catch (Exception e) {
            log.error("❌ Merge hatası: {}", e.getMessage());
        }
    }
}