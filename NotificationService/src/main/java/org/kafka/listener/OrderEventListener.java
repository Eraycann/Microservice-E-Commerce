package org.kafka.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.config.RabbitMQConfig;
import org.kafka.event.OrderPlacedEvent;
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
public class OrderEventListener {

    private final List<NotificationStrategy> notificationStrategies;
    private final TemplateService templateService;

    // RabbitMQConfig'de tanımladığımız "notification.order-created.queue" kuyruğunu dinle
    @RabbitListener(queues = RabbitMQConfig.ORDER_CREATED_QUEUE)
    public void handleOrderPlacedEvent(OrderPlacedEvent event) {
        log.info("📦 Sipariş bildirimi alındı: {} -> {}", event.getOrderNumber(), event.getUserEmail());

        // 1. Şablon Değişkenlerini Hazırla
        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", event.getUserFullName());
        variables.put("orderNumber", event.getOrderNumber());
        variables.put("totalPrice", event.getTotalPrice());

        // 2. HTML İçeriği Oluştur (order-confirmation.html şablonunu kullanacağız)
        String htmlContent = templateService.generateHtmlContent("order-confirmation", variables);

        // 3. Strateji Deseni ile Gönder (Email, SMS vs.)
        for (NotificationStrategy strategy : notificationStrategies) {
            try {
                // Email Konusu: "Siparişiniz Alındı #SIPARISNO"
                String subject = "Siparişiniz Alındı #" + event.getOrderNumber();

                strategy.send(
                        event.getUserEmail(),
                        subject,
                        htmlContent,
                        event.getUserId()
                );
            } catch (Exception e) {
                log.error("❌ {} sipariş bildirimi başarısız: {}", strategy.getChannelName(), e.getMessage());
            }
        }
    }
}