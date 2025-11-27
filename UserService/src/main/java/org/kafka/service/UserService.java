package org.kafka.service;

import lombok.RequiredArgsConstructor;
import org.kafka.model.UserProfile;
import org.kafka.repository.UserRepository;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final Keycloak keycloak; // Config'den gelen nesne inject edildi

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

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

    // GÜNCELLENMİŞ SOFT DELETE
    public void deleteUser(String keycloakId) {
        // 1. Local DB'de Pasife Çek
        UserProfile user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Silinecek kullanıcı bulunamadı"));

        user.setActive(false);
        userRepository.save(user);

        // 2. Keycloak'ta Hesabı Disable Et (KİLİT NOKTA)
        disableKeycloakUser(keycloakId);
    }

    private void disableKeycloakUser(String keycloakId) {
        try {
            // Realm adını URL'den çekiyoruz
            String realmName = issuerUri.substring(issuerUri.lastIndexOf("/") + 1);

            // Kullanıcıyı getir
            UserRepresentation userRep = keycloak.realm(realmName)
                    .users()
                    .get(keycloakId)
                    .toRepresentation();

            // Enabled özelliğini false yap
            userRep.setEnabled(false);

            // Güncellemeyi Keycloak'a gönder
            keycloak.realm(realmName)
                    .users()
                    .get(keycloakId)
                    .update(userRep);

            System.out.println("Kullanıcı Keycloak'ta devre dışı bırakıldı: " + keycloakId);

        } catch (Exception e) {
            // Keycloak hatası alırsak loglayalım ama işlemi durdurmayalım (Opsiyonel)
            // Transactional kullanıyorsan rollback yapabilirsin.
            System.err.println("Keycloak disable işlemi başarısız: " + e.getMessage());
            // throw new RuntimeException("Keycloak hatası", e);
        }
    }

    // FAVORİ EKLEME
    public void addFavoriteProduct(String keycloakId, String productId) {
        UserProfile user = getUserByKeycloakId(keycloakId);

        // Set olduğu için aynı ID varsa eklemez, yoksa ekler.
        user.getFavoriteProductIds().add(productId);

        userRepository.save(user);
    }

    // FAVORİ ÇIKARMA
    public void removeFavoriteProduct(String keycloakId, String productId) {
        UserProfile user = getUserByKeycloakId(keycloakId);

        user.getFavoriteProductIds().remove(productId);

        userRepository.save(user);
    }

    // FAVORİ LİSTESİ DÖNME
    public Set<String> getFavoriteProducts(String keycloakId) {
        UserProfile user = getUserByKeycloakId(keycloakId);
        return user.getFavoriteProductIds();
    }
}