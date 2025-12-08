package org.kafka.repository;

import org.kafka.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    // Aynı sipariş numarasıyla daha önce başarılı ödeme var mı?
    boolean existsByOrderNumberAndStatus(String orderNumber, String status);
}