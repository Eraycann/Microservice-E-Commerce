package org.kafka.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // --- 1. Recommendation Service İçin (Activity Exchange) ---
    public static final String ACTIVITY_EXCHANGE = "user.activity.exchange";

    // Routing Keys (Aksiyon Tipleri)
    public static final String ROUTING_KEY_PURCHASE = "interaction.purchase";
    public static final String ROUTING_KEY_CART_ADD = "interaction.cart.add"; // <-- EKSİK OLAN BU SATIRDI

    // --- 2. Notification Service İçin (Order Exchange) ---
    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String ROUTING_KEY_ORDER_CREATED = "order.created";

    // --- Exchange Tanımları ---

    @Bean
    public TopicExchange activityExchange() {
        return new TopicExchange(ACTIVITY_EXCHANGE);
    }

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    // --- Standart Converter ---
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}