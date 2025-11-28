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

    // 1. User Oluşum Olayları (Mevcut)
    public static final String USER_EXCHANGE = "user.exchange";
    public static final String ROUTING_KEY_USER_CREATED = "user.created";

    // 2. User Aktivite Olayları (YENİ - Recommendation İçin)
    // Farklı servislerden (Cart, Order) de buraya mesaj akacak.
    public static final String ACTIVITY_EXCHANGE = "user.activity.exchange";
    public static final String ROUTING_KEY_VIEW = "interaction.view";

    // Exchange Tanımları
    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    @Bean
    public TopicExchange activityExchange() {
        return new TopicExchange(ACTIVITY_EXCHANGE);
    }

    // JSON Converter (Aynen Kalıyor)
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