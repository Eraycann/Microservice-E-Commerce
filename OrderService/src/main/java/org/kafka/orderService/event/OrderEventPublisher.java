package org.kafka.orderService.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.config.RabbitMQConfig;
import org.kafka.orderService.model.Order;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Sipariş tamamlandığında çalışır.
     * @param order Sipariş nesnesş
     * @param email Kullanıcı maili (JWT'den geldi)
     * @param fullName Kullanıcı adı (JWT'den geldi)
     */
    public void publishOrderEvents(Order order, String email, String fullName) {
        sendOrderCreatedNotification(order, email, fullName);
        sendRecommendationData(order);
    }

    // 1. NOTIFICATION SERVICE İÇİN (Sipariş Onay Maili)
    private void sendOrderCreatedNotification(Order order, String email, String fullName) {
        try {
            // Event nesnesini JWT verileriyle dolduruyoruz
            OrderPlacedEvent event = new OrderPlacedEvent(
                    order.getOrderNumber(),
                    order.getUserId(),
                    email,      // "admin@example.com"
                    fullName,   // "ADMİN ADMİN"
                    order.getTotalPrice()
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ORDER_EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_ORDER_CREATED,
                    event
            );
            log.info("📧 Notification Event fırlatıldı: {} -> {}", order.getOrderNumber(), email);

        } catch (Exception e) {
            // Mail eventi atamazsak siparişi iptal etme, sadece logla.
            log.error("❌ Notification Event hatası: {}", e.getMessage());
        }
    }

    // 2. RECOMMENDATION SERVICE İÇİN (Satın Alma Verisi)
    private void sendRecommendationData(Order order) {
        if (order.getItems() == null) return;

        order.getItems().forEach(item -> {
            try {
                UserInteractionEvent event = new UserInteractionEvent(
                        order.getUserId(),
                        item.getProductId(), // String olarak gönderiyoruz
                        "PURCHASE",          // Olay tipi
                        System.currentTimeMillis()
                );

                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.ACTIVITY_EXCHANGE,
                        RabbitMQConfig.ROUTING_KEY_PURCHASE,
                        event
                );

            } catch (Exception e) {
                log.error("❌ Recommendation Event hatası: {}", e.getMessage());
            }
        });
        log.info("🤖 Recommendation verileri gönderildi. Ürün Sayısı: {}", order.getItems().size());
    }
}