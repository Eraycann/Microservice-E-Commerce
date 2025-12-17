package org.kafka.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.config.RabbitMQConfig;
import org.kafka.dto.ProductEvent;
import org.kafka.model.Product;
import org.kafka.model.ProductImage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public void sendProductEvent(Product product, String eventType) {
        try {
            // 1. Ana Resim Bulma
            String mainImageUrl = product.getImages().stream()
                    .filter(ProductImage::isMain)
                    .findFirst()
                    .map(ProductImage::getUrl)
                    .orElse(null);

            // 2. Specs JSON String -> Map Dönüşümü
            Map<String, Object> specsMap = new HashMap<>();
            if (product.getSpecs() != null && product.getSpecs().getSpecsData() != null) {
                try {
                    specsMap = objectMapper.readValue(
                            product.getSpecs().getSpecsData(),
                            new TypeReference<Map<String, Object>>() {}
                    );
                } catch (Exception e) {
                    log.error("JSON parse hatası (Specs): {}", e.getMessage());
                }
            }

            // 3. Event Oluşturma
            ProductEvent event = ProductEvent.builder()
                    .eventType(eventType)
                    .id(product.getId())
                    .name(product.getName())
                    .description(product.getDescription())
                    .price(product.getPrice())
                    .brandName(product.getBrand().getName())
                    .categoryName(product.getCategory().getName())
                    .slug(product.getSlug())
                    .imageUrl(mainImageUrl)
                    .active(true) // Varsayılan aktif
                    // --- YENİ EKLENEN ---
                    .featured(product.isFeatured())
                    .specs(specsMap)
                    .build();

            // 4. Gönderim (Routing Key: product.create, product.update vs.)
            String routingKey = RabbitMQConfig.ROUTING_KEY_BASE + eventType.toLowerCase();
            rabbitTemplate.convertAndSend(RabbitMQConfig.PRODUCT_EXCHANGE, routingKey, event);

            log.info("🐰 Event gönderildi: {} -> ID: {}", routingKey, product.getId());

        } catch (Exception e) {
            // RabbitMQ hatası Transaction'ı rollback yapmamalı, sadece logluyoruz.
            // İleride Outbox Pattern ile burası güçlendirilebilir.
            log.error("❌ Event gönderme hatası: {}", e.getMessage());
        }
    }
}