package org.kafka.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // --- PRODUCT SERVICE AYARLARI (Mevcut) ---
    public static final String PRODUCT_EXCHANGE = "product.exchange";
    public static final String SEARCH_QUEUE = "search.product-updated.queue";
    public static final String ROUTING_KEY_PRODUCT = "product.#";

    // --- YENİ: ORDER SERVICE AYARLARI ---
    public static final String ORDER_EXCHANGE = "order.exchange";
    // Bu kuyruğu "search" servisi dinleyecek
    public static final String SEARCH_ORDER_QUEUE = "search.order-created.queue";
    public static final String ROUTING_KEY_ORDER = "order.created";

    // --- EXCHANGE ---
    @Bean
    public TopicExchange productExchange() {
        return new TopicExchange(PRODUCT_EXCHANGE);
    }

    @Bean
    public TopicExchange orderExchange() { // Order Service'teki Exchange ile aynı isimde
        return new TopicExchange(ORDER_EXCHANGE);
    }

    // --- QUEUES ---
    @Bean
    public Queue searchQueue() {
        return new Queue(SEARCH_QUEUE, true);
    }

    @Bean
    public Queue searchOrderQueue() { // Yeni Kuyruk
        return new Queue(SEARCH_ORDER_QUEUE, true);
    }

    // --- BINDINGS ---
    @Bean
    public Binding bindingProduct(Queue searchQueue, TopicExchange productExchange) {
        return BindingBuilder.bind(searchQueue).to(productExchange).with(ROUTING_KEY_PRODUCT);
    }

    @Bean
    public Binding bindingOrder(Queue searchOrderQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(searchOrderQueue).to(orderExchange).with(ROUTING_KEY_ORDER);
    }

    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }
}