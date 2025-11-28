package org.kafka.service;

import lombok.RequiredArgsConstructor;
import org.kafka.config.RabbitMQConfig;
import org.kafka.event.UserCreatedEvent;
import org.kafka.model.Address;
import org.kafka.model.NotificationSettings;
import org.kafka.model.UserProfile;
import org.kafka.repository.UserRepository;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final Keycloak keycloak;
    private final RabbitTemplate rabbitTemplate; // 1. RabbitTemplate Inject Edildi

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    // =================================================================================
    // 1. KULLANICI PROFİL YÖNETİMİ (PROFILE MANAGEMENT)
    // =================================================================================

    // --- Public Ana Metotlar (Controller Endpoints) ---

    /**
     * Kullanıcı bilgilerini getirir. Eğer DB'de yoksa Token'dan oluşturur (Lazy Migration).
     * Kullanım: GET /api/users/me
     */
    public UserProfile getOrCreateUserProfile(Jwt jwt) {
        String keycloakId = jwt.getClaimAsString("sub");
        return userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> createUserFromToken(jwt));
    }

    /**
     * Kullanıcının kişisel bilgilerini hem MongoDB'de hem de Keycloak'ta günceller.
     * Adresleri ellemez.
     * Kullanım: PUT /api/users/me
     */
    @CacheEvict(value = "user_profile", key = "#keycloakId")
    public UserProfile updateProfile(String keycloakId, UserProfile updatedProfile) {
        UserProfile existing = getUserByKeycloakId(keycloakId);

        // 1. MongoDB Güncellemesi
        if (updatedProfile.getPhoneNumber() != null) existing.setPhoneNumber(updatedProfile.getPhoneNumber());
        if (updatedProfile.getTaxNumber() != null) existing.setTaxNumber(updatedProfile.getTaxNumber());

        boolean nameChanged = false;
        if (updatedProfile.getFirstName() != null) {
            existing.setFirstName(updatedProfile.getFirstName());
            nameChanged = true;
        }
        if (updatedProfile.getLastName() != null) {
            existing.setLastName(updatedProfile.getLastName());
            nameChanged = true;
        }

        UserProfile savedProfile = userRepository.save(existing);

        // 2. Keycloak Güncellemesi (Eğer isim değiştiyse)
        if (nameChanged) {
            updateKeycloakUser(keycloakId, existing.getFirstName(), existing.getLastName());
        }

        return savedProfile;
    }

    // --- Private Yardımcı Metotlar ---

    private UserProfile createUserFromToken(Jwt jwt) {
        UserProfile profile = UserProfile.builder()
                .keycloakId(jwt.getClaimAsString("sub"))
                .username(jwt.getClaimAsString("preferred_username"))
                .email(jwt.getClaimAsString("email"))
                .firstName(jwt.getClaimAsString("given_name"))
                .lastName(jwt.getClaimAsString("family_name"))
                .active(true)
                .build();

        UserProfile savedProfile = userRepository.save(profile);

        // 2. RABBITMQ MESAJ GÖNDERİMİ
        // Veritabanına başarıyla kaydolduktan sonra eventi fırlatıyoruz.
        try {
            UserCreatedEvent event = new UserCreatedEvent(
                    savedProfile.getKeycloakId(),
                    savedProfile.getEmail(),
                    savedProfile.getFirstName(),
                    savedProfile.getLastName(),
                    savedProfile.getUsername()
            );

            // Exchange Adı, Routing Key, Mesaj Objesi
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_USER_CREATED,
                    event
            );

            System.out.println("🐇 RabbitMQ Olayı Fırlatıldı: " + event.email());

        } catch (Exception e) {
            // Mesaj gitmezse user oluşumunu durdurmayalım, sadece loglayalım.
            System.err.println("RabbitMQ Hatası: " + e.getMessage());
        }

        return savedProfile;
    }

    /**
     * Keycloak üzerindeki Ad ve Soyad bilgilerini günceller.
     */
    private void updateKeycloakUser(String keycloakId, String firstName, String lastName) {
        try {
            String realmName = issuerUri.substring(issuerUri.lastIndexOf("/") + 1);

            // Mevcut kullanıcıyı çek
            UserRepresentation userRep = keycloak.realm(realmName).users().get(keycloakId).toRepresentation();

            // Değerleri güncelle
            userRep.setFirstName(firstName);
            userRep.setLastName(lastName);

            // Keycloak'a gönder
            keycloak.realm(realmName).users().get(keycloakId).update(userRep);

            System.out.println("Keycloak kullanıcı bilgileri güncellendi: " + keycloakId);
        } catch (Exception e) {
            // Hata logla ama MongoDB işlemini geri alma (Opsiyonel: Exception fırlatıp işlemi komple geri alabilirsin)
            System.err.println("Keycloak güncelleme hatası: " + e.getMessage());
        }
    }

    // =================================================================================
    // 2. ADRES YÖNETİMİ (ADDRESS MANAGEMENT)
    // =================================================================================

    // --- Public Ana Metotlar (Controller Endpoints) ---

    /**
     * Kullanıcının kayıtlı adres listesini döner.
     * Kullanım: GET /api/users/addresses
     */
    public List<Address> getAddresses(String keycloakId) {
        UserProfile user = getUserByKeycloakId(keycloakId);
        return user.getAddresses() != null ? user.getAddresses() : new ArrayList<>();
    }

    /**
     * Yeni adres ekler. İlk adres ise veya kullanıcı istediyse varsayılan yapar.
     * Kullanım: POST /api/users/addresses
     */
    @CacheEvict(value = "user_profile", key = "#keycloakId")
    public UserProfile addAddress(String keycloakId, Address newAddress) {
        UserProfile user = getUserByKeycloakId(keycloakId);

        if (user.getAddresses() == null) {
            user.setAddresses(new ArrayList<>());
        }

        if (newAddress.isDefaultAddress() || user.getAddresses().isEmpty()) {
            user.getAddresses().forEach(a -> a.setDefaultAddress(false));
            newAddress.setDefaultAddress(true);
        }

        user.getAddresses().add(newAddress);
        return userRepository.save(user);
    }

    /**
     * Belirtilen ID'li adresi varsayılan yapar, diğerlerini pasife çeker.
     * Kullanım: PATCH /api/users/addresses/{id}/default
     */
    @CacheEvict(value = "user_profile", key = "#keycloakId")
    public UserProfile setAddressAsDefault(String keycloakId, String addressId) {
        UserProfile user = getUserByKeycloakId(keycloakId);

        if (user.getAddresses() == null || user.getAddresses().isEmpty()) {
            throw new RuntimeException("Adres listesi boş.");
        }

        boolean exists = user.getAddresses().stream().anyMatch(a -> a.getId().equals(addressId));
        if (!exists) throw new RuntimeException("Adres bulunamadı: " + addressId);

        user.getAddresses().forEach(a -> {
            a.setDefaultAddress(a.getId().equals(addressId));
        });

        return userRepository.save(user);
    }

    // =================================================================================
    // 3. FAVORİ ÜRÜNLER (FAVORITES)
    // =================================================================================

    // --- Public Ana Metotlar (Controller Endpoints) ---

    /**
     * Kullanıcının favori ürün ID listesini döner.
     * Kullanım: GET /api/users/favorites
     */
    public Set<String> getFavoriteProducts(String keycloakId) {
        return getUserByKeycloakId(keycloakId).getFavoriteProductIds();
    }

    /**
     * Ürünü favorilere ekler.
     * Kullanım: POST /api/users/favorites/{id}
     */
    @CacheEvict(value = "user_profile", key = "#keycloakId")
    public void addFavoriteProduct(String keycloakId, String productId) {
        UserProfile user = getUserByKeycloakId(keycloakId);
        user.getFavoriteProductIds().add(productId);
        userRepository.save(user);
    }

    /**
     * Ürünü favorilerden çıkarır.
     * Kullanım: DELETE /api/users/favorites/{id}
     */
    @CacheEvict(value = "user_profile", key = "#keycloakId")
    public void removeFavoriteProduct(String keycloakId, String productId) {
        UserProfile user = getUserByKeycloakId(keycloakId);
        user.getFavoriteProductIds().remove(productId);
        userRepository.save(user);
    }

    // =================================================================================
    // 4. HESAP SİLME & GÜVENLİK (DELETION & SECURITY)
    // =================================================================================

    // --- Public Ana Metotlar (Controller Endpoints) ---

    /**
     * Kullanıcıyı local DB'de pasife çeker ve Keycloak'ta disable eder.
     * Kullanım: DELETE /api/users/me
     */
    @CacheEvict(value = "user_profile", key = "#keycloakId")
    public void deleteUser(String keycloakId) {
        UserProfile user = getUserByKeycloakId(keycloakId);

        // 1. Local Soft Delete
        user.setActive(false);
        userRepository.save(user);

        // 2. Keycloak Disable
        disableKeycloakUser(keycloakId);
    }

    // --- Private Yardımcı Metotlar ---

    private void disableKeycloakUser(String keycloakId) {
        try {
            String realmName = issuerUri.substring(issuerUri.lastIndexOf("/") + 1);
            UserRepresentation userRep = keycloak.realm(realmName).users().get(keycloakId).toRepresentation();
            userRep.setEnabled(false);
            keycloak.realm(realmName).users().get(keycloakId).update(userRep);
            System.out.println("Kullanıcı Keycloak'ta pasife alındı: " + keycloakId);
        } catch (Exception e) {
            System.err.println("Keycloak erişim hatası: " + e.getMessage());
        }
    }

    // =================================================================================
    // 5. ORTAK ÇEKİRDEK METOTLAR (SHARED CORE)
    // =================================================================================

    /**
     * Keycloak ID ile kullanıcıyı bulur, bulamazsa hata fırlatır.
     * Hem Admin endpoint'i hem de diğer servis metotları tarafından kullanılır.
     */
    @Cacheable(value = "user_profile", key = "#keycloakId")
    public UserProfile getUserByKeycloakId(String keycloakId) {
        // Log koyalım ki Cache çalışıyor mu görelim (Sadece ilk seferde yazmalı)
        System.out.println("⚡ Veritabanına gidiliyor... ID: " + keycloakId);

        return userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + keycloakId));
    }

    // =================================================================================
    // 6. İLETİŞİM TERCİHLERİ (NOTIFICATION PREFERENCES) - YENİ
    // =================================================================================

    /**
     * Kullanıcının iletişim tercihlerini günceller.
     * Kullanım: PATCH /api/users/me/notifications
     */
    @CacheEvict(value = "user_profile", key = "#keycloakId")
    public UserProfile updateNotificationSettings(String keycloakId, NotificationSettings newSettings) {
        UserProfile user = getUserByKeycloakId(keycloakId);

        // Eğer null geldiyse başlat (Migration sorunu yaşamamak için)
        if (user.getNotificationSettings() == null) {
            user.setNotificationSettings(new org.kafka.model.NotificationSettings());
        }

        // Ayarları güncelle
        user.getNotificationSettings().setEmailEnabled(newSettings.isEmailEnabled());
        user.getNotificationSettings().setSmsEnabled(newSettings.isSmsEnabled());
        user.getNotificationSettings().setPushEnabled(newSettings.isPushEnabled());

        return userRepository.save(user);
    }
}