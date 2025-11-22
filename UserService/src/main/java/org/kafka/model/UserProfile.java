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
public class UserProfile extends BaseEntity { // BaseEntity'yi önceki adımda eklemiştik

    @Id
    private String id;

    @Indexed(unique = true)
    private String keycloakId;

    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;

    // E-Ticaret Alanları
    private String taxNumber;
    private List<Address> addresses;
    private boolean active = true; // Soft delete için

    // --- YENİ EKLENEN KISIM: FAVORİLER ---
    // Neden Set? Çünkü List kullanırsak kullanıcı yanlışlıkla butona 2 kere basarsa aynı ürünü 2 kere ekler. Set matematikteki küme gibidir, aynı elemandan sadece bir tane tutar (Unique).
    // Builder kullanırken Set'in null gelmemesi için default değer atıyoruz
    @Builder.Default
    private Set<String> favoriteProductIds = new HashSet<>();
}