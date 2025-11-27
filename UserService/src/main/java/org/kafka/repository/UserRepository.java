package org.kafka.repository;

import org.kafka.model.UserProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<UserProfile, String> {
    // Keycloak ID'sine göre kullanıcıyı bul
    Optional<UserProfile> findByKeycloakId(String keycloakId);
}