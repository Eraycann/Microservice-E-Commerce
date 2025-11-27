package org.kafka.config;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Keycloak Admin Client nesnesini Spring Context'ine eklemek için
@Configuration
public class KeycloakAdminConfig {

    @Value("${keycloak.admin.client-id}")
    private String clientId;

    @Value("${keycloak.admin.client-secret}")
    private String clientSecret;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    // Admin işlemleri için Keycloak nesnesini Bean olarak oluşturur
    @Bean
    public Keycloak keycloak() {
        // issuerUri'den temel auth-server URL'sini ayıklıyoruz.
        // Örnek: http://localhost:8180/realms/ecommerce-realm -> http://localhost:8180
        String authServerUrl = issuerUri.substring(0, issuerUri.lastIndexOf("/realms"));

        // Realm adını URL'den ayıklıyoruz
        String realmName = issuerUri.substring(issuerUri.lastIndexOf("/") + 1);

        return KeycloakBuilder.builder()
                .serverUrl(authServerUrl)
                .realm(realmName)
                .clientId(clientId)
                .clientSecret(clientSecret)
                .grantType("client_credentials") // Servisler arası iletişim için bu tip kullanılır
                .build();
    }
}