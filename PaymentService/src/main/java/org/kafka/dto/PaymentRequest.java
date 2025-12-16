package org.kafka.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private String userId;
    private String orderNumber;
    private BigDecimal amount;
}