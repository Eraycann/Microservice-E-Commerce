package org.kafka.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Product Service'in yayın yapacağı Exchange ismi (Ortak olmalı)
    public static final String PRODUCT_EXCHANGE = "product.exchange";

    // Search Service'in dinleyeceği kuyruk
    public static final String SEARCH_QUEUE = "search.product-updated.queue";

    // Routing Key: Product ile ilgili olayları yakala
    public static final String ROUTING_KEY = "product.#";

    @Bean
    public TopicExchange productExchange() {
        return new TopicExchange(PRODUCT_EXCHANGE);
    }

    @Bean
    public Queue searchQueue() {
        return new Queue(SEARCH_QUEUE, true); // Durable
    }

    @Bean
    public Binding binding(Queue searchQueue, TopicExchange productExchange) {
        return BindingBuilder.bind(searchQueue).to(productExchange).with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }
}