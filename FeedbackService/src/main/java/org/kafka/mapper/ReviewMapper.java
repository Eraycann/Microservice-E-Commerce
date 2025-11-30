package org.kafka.mapper;

import org.kafka.dto.ReviewRequest;
import org.kafka.dto.ReviewResponse;
import org.kafka.model.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "userFullName", ignore = true)
    @Mapping(target = "createdAt", expression = "java(java.time.Instant.now())")
    @Mapping(target = "helpfulCount", constant = "0")
    Review toEntity(ReviewRequest request);

    @Mapping(target = "username", source = "userFullName")
    // Instant -> String dönüşümü için özel metodumuzu kullan diyoruz
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "formatInstant")
    ReviewResponse toResponse(Review review);

    // --- ÇEVİRİCİ METOT ---
    @Named("formatInstant")
    default String mapInstantToString(Instant instant) {
        if (instant == null) {
            return null;
        }
        // ISO-8601 Formatı (Örn: 2024-05-20T15:30:00Z)
        return DateTimeFormatter.ISO_INSTANT
                .withZone(ZoneId.of("UTC"))
                .format(instant);
    }
}