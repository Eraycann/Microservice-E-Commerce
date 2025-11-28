package org.kafka.event;

import java.io.Serializable;

// Serializable olması RabbitMQ için iyi pratiktir, ancak JSON converter kullanacağımız için şart değil.
// Yine de veri taşıma nesnesi olduğu için ekleyelim.
public record UserCreatedEvent(
        String keycloakId,
        String email,
        String firstName,
        String lastName,
        String username
) implements Serializable {}