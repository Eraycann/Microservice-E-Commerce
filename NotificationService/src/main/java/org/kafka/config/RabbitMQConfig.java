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

    // User Service ile AYNI Exchange
    public static final String USER_EXCHANGE = "user.exchange";
    public static final String ROUTING_KEY_USER_CREATED = "user.created";

    // Bu servise özel kuyruk
    public static final String NOTIFICATION_USER_CREATED_QUEUE = "notification.user-created.queue";

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    @Bean
    public Queue userCreatedQueue() {
        return new Queue(NOTIFICATION_USER_CREATED_QUEUE, true);
    }

    @Bean
    public Binding binding(Queue userCreatedQueue, TopicExchange userExchange) {
        return BindingBuilder
                .bind(userCreatedQueue)
                .to(userExchange)
                .with(ROUTING_KEY_USER_CREATED);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}