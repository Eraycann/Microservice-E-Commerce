package org.kafka.repository;

import org.kafka.model.UserInteraction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface UserInteractionRepository extends MongoRepository<UserInteraction, String> {
    // İleride "Bu kullanıcı nelerle etkileşime girdi?" diye soracağız
    List<UserInteraction> findByUserId(String userId);
}