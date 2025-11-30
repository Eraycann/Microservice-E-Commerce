package org.kafka.mapper;

import org.kafka.dto.ReviewRequest;
import org.kafka.dto.ReviewResponse;
import org.kafka.model.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "userFullName", ignore = true)
    @Mapping(target = "createdAt", expression = "java(java.time.Instant.now())")
    @Mapping(target = "helpfulCount", constant = "0")
    Review toEntity(ReviewRequest request);

    @Mapping(target = "username", source = "userFullName")
        // 'createdAt' satırını sildik, otomatik eşleşecek.
        // 'formatInstant' metodunu sildik.
    ReviewResponse toResponse(Review review);
}