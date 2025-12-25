package org.kafka.mapper;

import org.kafka.event.UserInteractionEvent;
import org.kafka.model.UserInteraction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Instant;

@Mapper(componentModel = "spring", imports = Instant.class)
public interface InteractionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", expression = "java(Instant.ofEpochMilli(event.getTimestamp()))") // timestamp (long) -> createdAt (Instant) dönüşümünü elle yapıyoruz
        // event.guestId -> entity.guestId otomatik eşleşir (isimler aynı)
    UserInteraction toEntity(UserInteractionEvent event);
}