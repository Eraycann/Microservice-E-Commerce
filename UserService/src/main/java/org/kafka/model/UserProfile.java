package org.kafka.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class UserProfile extends BaseEntity {

    @Id
    private String id; // MongoDB ID (Internal)

    @Indexed(unique = true)
    private String keycloakId; // Keycloak ID (External Reference)

    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String taxNumber; // Vergi No

    private List<Address> addresses;

    private boolean active = true; // Soft Delete için

    @Builder.Default
    private Set<String> favoriteProductIds = new HashSet<>();

    // --- YENİ EKLENEN KISIM ---
    @Builder.Default
    private NotificationSettings notificationSettings = new NotificationSettings();
}