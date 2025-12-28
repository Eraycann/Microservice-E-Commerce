package org.kafka.mapper;

import org.kafka.dto.QuestionResponse;
import org.kafka.model.ProductQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    @Mapping(source = "questionText", target = "question")
    @Mapping(source = "answerText", target = "answer")
    QuestionResponse toResponse(ProductQuestion question);
}