package org.kafka.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.config.RabbitMQConfig;
import org.kafka.event.UserCreatedEvent;
import org.kafka.service.EmailService;
import org.kafka.service.TemplateService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserEventListener {

    private final EmailService emailService;
    private final TemplateService templateService;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_USER_CREATED_QUEUE)
    public void handleUserCreatedEvent(UserCreatedEvent event) {
        log.info("🔔 Yeni kullanıcı bildirimi alındı: {}", event.email());

        // 1. Şablon verilerini hazırla
        Map<String, Object> variables = new HashMap<>();
        variables.put("firstName", event.firstName());
        variables.put("lastName", event.lastName());

        // 2. HTML içeriği oluştur
        String htmlContent = templateService.generateHtmlContent("welcome-email", variables);

        // 3. Maili gönder
        emailService.sendHtmlEmail(
                event.email(),
                "Aramıza Hoşgeldin! 🚀",
                htmlContent,
                event.keycloakId()
        );
    }
}