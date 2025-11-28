package org.kafka.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // User Service ile AYNI Exchange ismi olmalı
    public static final String ACTIVITY_EXCHANGE = "user.activity.exchange";

    // Bu servise özel kuyruk ismi
    public static final String RECOMMENDATION_QUEUE = "recommendation.queue";

    // Routing Key Pattern: interaction ile başlayan her şeyi yakala (view, cart, purchase)
    public static final String ROUTING_KEY_PATTERN = "interaction.#";

    // 1. Exchange Tanımı (Eğer User Service oluşturmadıysa garanti olsun diye buraya da koyuyoruz)
    @Bean
    public TopicExchange activityExchange() {
        return new TopicExchange(ACTIVITY_EXCHANGE);
    }

    // 2. Kuyruk Tanımı
    @Bean
    public Queue recommendationQueue() {
        return new Queue(RECOMMENDATION_QUEUE, true); // Durable = true (RabbitMQ kapansa da kuyruk silinmez)
    }

    // 3. Binding (Kuyruğu Exchange'e Bağlama)
    @Bean
    public Binding binding(Queue recommendationQueue, TopicExchange activityExchange) {
        return BindingBuilder
                .bind(recommendationQueue)
                .to(activityExchange)
                .with(ROUTING_KEY_PATTERN);
    }

    // JSON Converter (User Service ile aynı dili konuşmak için)
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}