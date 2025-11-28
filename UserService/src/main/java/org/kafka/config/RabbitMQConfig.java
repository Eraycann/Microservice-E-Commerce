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

    // Exchange Adı: Bu isimle mesaj yayınlayacağız.
    public static final String USER_EXCHANGE = "user.exchange";

    // Routing Key: Mesajın rotası (Notification servisi buna göre dinleyecek)
    public static final String ROUTING_KEY_USER_CREATED = "user.created";

    // 1. Exchange Tanımı (Topic Exchange en esneğidir)
    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    // 2. JSON Converter (Mesajlar kuyruğa JSON olarak gitsin)
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // 3. RabbitTemplate'e JSON Converter'ı Tanıtma
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}