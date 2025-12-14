package org.kafka.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.config.RabbitMQConfig;
import org.kafka.dto.ProductEvent;
import org.kafka.model.ProductIndex;
import org.kafka.service.SearchService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductEventListener {

    private final SearchService searchService;

    @RabbitListener(queues = RabbitMQConfig.SEARCH_QUEUE)
    public void handleProductEvent(ProductEvent event) {
        log.info("📨 Event alındı: {} - ID: {}", event.getEventType(), event.getId());

        if ("DELETE".equals(event.getEventType())) {
            searchService.deleteProduct(String.valueOf(event.getId()));
        } else {
            // CREATE veya UPDATE durumunda veriyi Elastic modeline çevir ve kaydet
            ProductIndex index = ProductIndex.builder()
                    .id(String.valueOf(event.getId()))
                    .name(event.getName())
                    .description(event.getDescription())
                    .price(event.getPrice())
                    .brand(event.getBrandName())
                    .category(event.getCategoryName())
                    .slug(event.getSlug())
                    .imageUrl(event.getImageUrl())
                    .active(event.isActive())
                    .build();

            searchService.saveProduct(index);
        }
    }
}