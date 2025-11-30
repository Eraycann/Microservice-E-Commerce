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

    // 1. Ana Değişkenler
    public static final String USER_EXCHANGE = "user.exchange";
    public static final String ROUTING_KEY_USER_CREATED = "user.created";
    public static final String NOTIFICATION_USER_CREATED_QUEUE = "notification.user-created.queue";

    // 2. Dead Letter Queue (DLQ) Tanımları - YENİ
    public static final String DLQ_EXCHANGE = "notification.dlq.exchange";
    public static final String DLQ_QUEUE = "notification.user-created.dlq";
    public static final String DLQ_ROUTING_KEY = "notification.dlq";

    // --- Exchange Tanımları ---
    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    @Bean
    public TopicExchange dlqExchange() {
        return new TopicExchange(DLQ_EXCHANGE);
    }

    // --- Kuyruk Tanımları ---

    // A. Hata Kuyruğu (DLQ) - Sadece bekler
    @Bean
    public Queue dlqQueue() {
        return new Queue(DLQ_QUEUE, true);
    }

    @Bean
    // DÜZELTME BURADA: Parantez içine Queue ve TopicExchange eklendi.
    // Spring bu parametreleri otomatik olarak yukarıdaki @Bean metodlarından bulup buraya koyacak.
    public Binding dlqBinding(Queue dlqQueue, TopicExchange dlqExchange) {
        return BindingBuilder
                .bind(dlqQueue)
                .to(dlqExchange)
                .with(DLQ_ROUTING_KEY);
    }

    // B. Ana Kuyruk (Hata olursa DLQ'ya gitme özellikli)
    @Bean
    public Queue userCreatedQueue() {
        return QueueBuilder.durable(NOTIFICATION_USER_CREATED_QUEUE)
                .withArgument("x-dead-letter-exchange", DLQ_EXCHANGE) // Ölürsem buraya at
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding binding(Queue userCreatedQueue, TopicExchange userExchange) {
        return BindingBuilder
                .bind(userCreatedQueue)
                .to(userExchange)
                .with(ROUTING_KEY_USER_CREATED);
    }

    // --- Converter ---
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}