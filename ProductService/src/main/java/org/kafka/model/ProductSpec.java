package org.kafka.model;

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

    // JSONB: Dinamik teknik özellikler
    @Column(name = "specs_data", columnDefinition = "jsonb", nullable = false)
    private String specsData;
}
