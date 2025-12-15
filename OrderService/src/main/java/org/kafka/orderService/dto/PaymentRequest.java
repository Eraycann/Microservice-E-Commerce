package org.kafka.orderService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentRequest {
    private String userId;
    private Double amount;
    private String orderNumber;
}
