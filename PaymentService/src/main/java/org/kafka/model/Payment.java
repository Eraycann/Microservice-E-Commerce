package org.kafka.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CurrentTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Bir sipariş için sadece TEK bir başarılı ödeme olabilir.
    @Column(nullable = false)
    private String orderNumber;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private BigDecimal amount;

    // SUCCESS, FAILED
    private String status;

    // Bankadan dönen sahte referans numarası
    private String transactionReference;

    @CurrentTimestamp
    private LocalDateTime transactionDate;
}