package org.kafka.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchange Adı (Search Service ile AYNI olmalı)
    public static final String PRODUCT_EXCHANGE = "product.exchange";

    // Routing Key Prefix (Örn: product.created, product.updated)
    public static final String ROUTING_KEY_BASE = "product.";

    @Bean
    public TopicExchange productExchange() {
        return new TopicExchange(PRODUCT_EXCHANGE);
    }

    // Mesajları JSON formatında göndermek için Converter
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}