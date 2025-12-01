package org.kafka.orderService.model;

import jakarta.persistence.*;
import lombok.*;
import org.kafka.orderService.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNumber; // UUID (Frontend'e gösterilen kod)
    private String userId;      // Keycloak ID

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private BigDecimal totalPrice;

    // Fatura/Kargo Adres Bilgileri (Şimdilik basit tutuyoruz)
    private String shippingAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}