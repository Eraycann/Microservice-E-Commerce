package org.kafka.orderService.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderResponse {
    private String orderNumber;
    private String status;
    private BigDecimal totalPrice;
    private int itemCount;
    private LocalDateTime createdAt;
}