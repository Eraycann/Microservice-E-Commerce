package org.kafka.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "product_inventory")
@Getter
@Setter
public class ProductInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tek Yönlü İlişki: Inventory -> Product. Bu ilişkiyi Product'tan gelen 'mappedBy' yönetir.
    @OneToOne
    @JoinColumn(name = "product_id", referencedColumnName = "id", nullable = false, unique = true)
    private Product product;

    @Column(nullable = false)
    private Integer stockCount;

    private LocalDateTime lastUpdated;
}
