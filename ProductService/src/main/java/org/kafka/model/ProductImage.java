package org.kafka.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "product_images")
@Getter
@Setter
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String url;

    // Resmin görüntülenme sırası (1, 2, 3...)
    private Integer displayOrder;

    // Bu resim ana vitrin resmi mi?
    private boolean isMain = false;

    // Product ile ilişki (Product silinirse resimler de silinir)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}
