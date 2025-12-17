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

    public void publishOrderEvents(Order order, String email, String fullName) {
        // 1. Recommendation Service'e Haber Ver (Interaction Olarak)
        sendPurchaseInteractions(order);

        // 2. Search Service'e (ve Notification'a) Haber Ver (Order Event Olarak)
        sendOrderCreatedEvent(order, email, fullName);
    }

    // --- A. RECOMMENDATION SERVICE İÇİN ---
    // UserInteractionEvent gönderiyoruz. Recommendation servisi bunu zaten dinliyor.
    // Ekstra kuyruğa gerek yok.
    private void sendPurchaseInteractions(Order order) {
        if (order.getItems() == null) return;

        order.getItems().forEach(item -> {
            try {
                UserInteractionEvent event = new UserInteractionEvent(
                        order.getUserId(),
                        item.getProductId(),
                        "PURCHASE", // Olay Tipi
                        System.currentTimeMillis()
                );

                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.ACTIVITY_EXCHANGE,
                        RabbitMQConfig.ROUTING_KEY_PURCHASE, // "interaction.purchase"
                        event
                );

            } catch (Exception e) {
                log.error("❌ Recommendation Event Hatası: {}", e.getMessage());
            }
        });
        log.info("🛒 Satın alma interaction'ları gönderildi. Adet: {}", order.getItems().size());
    }

    // --- B. SEARCH & NOTIFICATION SERVICE İÇİN ---
    // OrderCreatedEvent gönderiyoruz. Search servisi satış sayılarını buradan güncelleyecek.
    private void sendOrderCreatedEvent(Order order, String email, String fullName) {
        try {
            // Ortak DTO kullanıyoruz (Notification ve Search için)
            OrderPlacedEvent event = new OrderPlacedEvent(
                    order.getOrderNumber(),
                    order.getUserId(),
                    email,
                    fullName,
                    order.getTotalPrice(),
                    // Ürünleri DTO'ya çevir
                    order.getItems().stream()
                            .map(item -> new OrderItemEvent(item.getProductId(), item.getQuantity()))
                            .toList()
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.ORDER_EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_ORDER_CREATED, // "order.created"
                    event
            );

            log.info("📦 Sipariş Eventi fırlatıldı: {}", order.getOrderNumber());

        } catch (Exception e) {
            log.error("❌ Order Event Hatası: {}", e.getMessage());
        }
    }
}