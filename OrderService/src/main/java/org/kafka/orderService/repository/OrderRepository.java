package org.kafka.orderService.repository;

import org.kafka.orderService.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findAllByUserId(String userId, Pageable pageable);
    
    /**
     * Toplam geliri hesaplar
     */
    @Query("SELECT COALESCE(SUM(o.totalPrice), 0.0) FROM Order o")
    double sumTotalPrice();
}