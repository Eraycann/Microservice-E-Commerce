package org.kafka.mapper;

import org.kafka.dto.QuestionResponse;
import org.kafka.model.ProductQuestion;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    // askDate ve answerDate için özel mapping sildik.
    // mapInstantToString metodunu sildik.
    QuestionResponse toResponse(ProductQuestion question);
}