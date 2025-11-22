package org.kafka.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class UserProfile extends BaseEntity{

    @Id
    private String id; // MongoDB'nin kendi ID'si (ObjectId)

    @Indexed(unique = true)
    private String keycloakId; // Keycloak'tan gelen 'sub' değeri (Bağlantı noktamız)

    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;

    // İlişkisel DB olsa ayrı tablo yapardık, burada gömüyoruz (Embedding)
    private List<Address> addresses;

    private boolean active = true;
}