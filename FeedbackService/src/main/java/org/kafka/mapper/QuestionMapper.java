package org.kafka.mapper;

import org.kafka.dto.QuestionResponse;
import org.kafka.model.ProductQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    // Tarih dönüşümleri için özel metodu işaret ediyoruz
    @Mapping(target = "askDate", source = "askDate", qualifiedByName = "formatInstant")
    @Mapping(target = "answerDate", source = "answerDate", qualifiedByName = "formatInstant")
    QuestionResponse toResponse(ProductQuestion question);

    // Instant -> String Çevirici (ReviewMapper'daki ile aynı)
    @Named("formatInstant")
    default String mapInstantToString(Instant instant) {
        if (instant == null) {
            return null;
        }
        return DateTimeFormatter.ISO_INSTANT
                .withZone(ZoneId.of("UTC"))
                .format(instant);
    }
}