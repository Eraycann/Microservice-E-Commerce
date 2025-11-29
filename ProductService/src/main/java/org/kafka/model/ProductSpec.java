package org.kafka.model;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "product_specs")
@Getter
@Setter
public class ProductSpec {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tek Yönlü İlişki: Spec -> Product. Bu ilişkiyi Product'tan gelen 'mappedBy' yönetir.
    @OneToOne
    @JoinColumn(name = "product_id", referencedColumnName = "id", nullable = false, unique = true)
    private Product product;

    // Hibernate'e bu String alanının PostgreSQL'deki jsonb tipine eşlenmesi gerektiğini söylüyoruz.
    @org.hibernate.annotations.Type(value = JsonType.class) // <-- BU SATIRI EKLEYİN
    @Column(name = "specs_data", columnDefinition = "jsonb", nullable = false)
    private String specsData;
}
