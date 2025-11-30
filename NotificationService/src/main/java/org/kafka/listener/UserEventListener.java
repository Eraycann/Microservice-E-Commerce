package org.kafka.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.config.RabbitMQConfig;
import org.kafka.event.UserCreatedEvent;
import org.kafka.service.TemplateService;
import org.kafka.service.strategy.NotificationStrategy;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserEventListener {

    // Spring, NotificationStrategy interface'ini implement eden
    // TÜM Bean'leri (EmailService, SmsService) bu listeye otomatik doldurur.
    private final List<NotificationStrategy> notificationStrategies;

    private final TemplateService templateService;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_USER_CREATED_QUEUE)
    public void handleUserCreatedEvent(UserCreatedEvent event) {
        log.info("🔔 Bildirim olayı alındı: {}", event.email());

        // Şablon hazırla
        Map<String, Object> variables = new HashMap<>();
        variables.put("firstName", event.firstName());
        variables.put("lastName", event.lastName());
        String htmlContent = templateService.generateHtmlContent("welcome-email", variables);

        // --- STRATEJİ DESENİ DEVREDE ---
        // Listede ne varsa (Email, SMS) hepsi için döngüye girer
        for (NotificationStrategy strategy : notificationStrategies) {
            try {
                // Şimdilik herkese her kanaldan atıyoruz.
                // İleride buraya "if (user.prefers(strategy.getChannelName()))" eklenebilir.

                strategy.send(
                        event.email(),          // SMS için telefon no UserCreatedEvent'e eklenmeli
                        "Aramıza Hoşgeldin!",
                        htmlContent,            // SMS için htmlContent yerine düz metin gerekir (İlerde ayrılmalı)
                        event.keycloakId()
                );
            } catch (Exception e) {
                log.error("❌ {} gönderimi başarısız: {}", strategy.getChannelName(), e.getMessage());
                // Burada throw yaparsak tüm işlem geri alınır (Transaction).
                // Duruma göre loglayıp devam edilebilir.
            }
        }
    }
}