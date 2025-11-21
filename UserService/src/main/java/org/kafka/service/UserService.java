package org.kafka.service;

import lombok.RequiredArgsConstructor;
import org.kafka.model.UserProfile;
import org.kafka.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Kullanıcı kendi profilini getirir
    public UserProfile getOrCreateUserProfile(Jwt jwt) {
        String keycloakId = jwt.getClaimAsString("sub");

        return userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> createUserFromToken(jwt));
    }

    // İlk defa giriş yapan kullanıcıyı DB'ye kaydeder
    private UserProfile createUserFromToken(Jwt jwt) {
        UserProfile profile = UserProfile.builder()
                .keycloakId(jwt.getClaimAsString("sub"))
                .username(jwt.getClaimAsString("preferred_username"))
                .email(jwt.getClaimAsString("email"))
                .firstName(jwt.getClaimAsString("given_name"))
                .lastName(jwt.getClaimAsString("family_name"))
                .build();
        return userRepository.save(profile);
    }

    // Kullanıcı Adres Ekler
    public UserProfile updateProfile(String keycloakId, UserProfile updatedProfile) {
        UserProfile existing = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        // Sadece güncellenebilir alanları set et
        existing.setPhoneNumber(updatedProfile.getPhoneNumber());
        existing.setAddresses(updatedProfile.getAddresses());

        return userRepository.save(existing);
    }

    // Admin veya sistemin ID ile kullanıcı bulması için
    public UserProfile getUserByKeycloakId(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + keycloakId));
    }
}