package org.kafka.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // Tek Yönlü İlişki 1: Product -> Category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    // Tek Yönlü İlişki 2: Product -> Brand
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    private String createdByUserId;
    private LocalDateTime createdAt;

    // Çift Yönlü İlişki (Zorunlu) 3 ve 4: Product <-> Inventory/Spec
    // Bu ilişki, Product yaratılırken Inventory ve Spec kaydının da otomatik oluşturulması
    // ve Product silinince otomatik silinmesi (Cascade) için gereklidir.

    // Inventory ve Spec verileri, Product'ın ayrılmaz bir parçasıdır.
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private ProductInventory inventory;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private ProductSpec specs;
}