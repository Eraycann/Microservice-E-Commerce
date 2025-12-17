package org.kafka.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.config.RabbitMQConfig;
import org.kafka.dto.OrderPlacedEvent;
import org.kafka.service.SearchService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final SearchService searchService;

    @RabbitListener(queues = RabbitMQConfig.SEARCH_ORDER_QUEUE)
    public void handleOrderCreatedEvent(OrderPlacedEvent event) {
        log.info("🛒 Sipariş Eventi Alındı: {}", event.getOrderNumber());

        if (event.getItems() != null) {
            for (OrderPlacedEvent.OrderItemEvent item : event.getItems()) {
                try {
                    // Asenkron ve Atomik Güncelleme
                    searchService.updateSalesCount(item.getProductId(), item.getQuantity());
                    log.debug("📈 Ürün satış sayısı artırıldı: {} (+{})", item.getProductId(), item.getQuantity());
                } catch (Exception e) {
                    log.error("❌ Satış sayısı güncellenemedi: ProductID={}", item.getProductId(), e);
                }
            }
        }
    }
}