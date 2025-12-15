package org.kafka.event;

import java.io.Serializable;

public record UserCreatedEvent(
        String keycloakId,
        String email,
        String firstName,
        String lastName,
        String username
) implements Serializable {}