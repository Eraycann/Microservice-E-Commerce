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

    // ==========================================
    // 1. SABİTLER (CONSTANTS)
    // ==========================================

    // User Service İle İlgili
    public static final String USER_EXCHANGE = "user.exchange";
    public static final String ROUTING_KEY_USER_CREATED = "user.created";
    public static final String NOTIFICATION_USER_CREATED_QUEUE = "notification.user-created.queue";

    // Order Service İle İlgili (YENİ EKLENDİ)
    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String ROUTING_KEY_ORDER_CREATED = "order.created";
    public static final String ORDER_CREATED_QUEUE = "notification.order-created.queue";

    // DLQ (Hata Yönetimi) İle İlgili
    public static final String DLQ_EXCHANGE = "notification.dlq.exchange";
    public static final String DLQ_QUEUE = "notification.user-created.dlq"; // Ortak DLQ kullanabiliriz
    public static final String DLQ_ROUTING_KEY = "notification.dlq";

    // ==========================================
    // 2. EXCHANGE TANIMLARI
    // ==========================================

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    // YENİ: Order Exchange Tanımı
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    @Bean
    public TopicExchange dlqExchange() {
        return new TopicExchange(DLQ_EXCHANGE);
    }

    // ==========================================
    // 3. KUYRUK TANIMLARI (QUEUES)
    // ==========================================

    // A. Hata Kuyruğu (DLQ)
    @Bean
    public Queue dlqQueue() {
        return new Queue(DLQ_QUEUE, true);
    }

    // B. User Created Kuyruğu (DLQ Özellikli)
    @Bean
    public Queue userCreatedQueue() {
        return QueueBuilder.durable(NOTIFICATION_USER_CREATED_QUEUE)
                .withArgument("x-dead-letter-exchange", DLQ_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
                .build();
    }

    // C. YENİ: Order Created Kuyruğu (DLQ Özellikli)
    @Bean
    public Queue orderCreatedQueue() {
        return QueueBuilder.durable(ORDER_CREATED_QUEUE)
                .withArgument("x-dead-letter-exchange", DLQ_EXCHANGE) // Hata olursa aynı DLQ'ya gitsin
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
                .build();
    }

    // ==========================================
    // 4. BINDING TANIMLARI (BAĞLAMALAR)
    // ==========================================

    // DLQ Binding
    @Bean
    public Binding dlqBinding(Queue dlqQueue, TopicExchange dlqExchange) {
        return BindingBuilder.bind(dlqQueue).to(dlqExchange).with(DLQ_ROUTING_KEY);
    }

    // User Binding
    @Bean
    public Binding bindingUser(Queue userCreatedQueue, TopicExchange userExchange) {
        return BindingBuilder
                .bind(userCreatedQueue)
                .to(userExchange)
                .with(ROUTING_KEY_USER_CREATED);
    }

    // YENİ: Order Binding
    @Bean
    public Binding bindingOrder(Queue orderCreatedQueue, TopicExchange orderExchange) {
        return BindingBuilder
                .bind(orderCreatedQueue)
                .to(orderExchange)
                .with(ROUTING_KEY_ORDER_CREATED);
    }

    // ==========================================
    // 5. CONVERTER
    // ==========================================
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}