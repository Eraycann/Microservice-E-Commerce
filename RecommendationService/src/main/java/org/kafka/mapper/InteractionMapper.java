package org.kafka.mapper;

import org.kafka.event.UserInteractionEvent;
import org.kafka.model.UserInteraction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Instant;

@Mapper(componentModel = "spring", imports = Instant.class)
public interface InteractionMapper {

    // timestamp (long) -> createdAt (Instant) dönüşümünü elle yapıyoruz
    @Mapping(target = "id", ignore = true) // MongoDB üretecek
    @Mapping(target = "createdAt", expression = "java(Instant.ofEpochMilli(event.getTimestamp()))")
    UserInteraction toEntity(UserInteractionEvent event);
}