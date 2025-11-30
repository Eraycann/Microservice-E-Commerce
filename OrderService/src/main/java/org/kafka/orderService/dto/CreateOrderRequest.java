package org.kafka.orderService.dto;

import lombok.Data;

@Data
public class CreateOrderRequest {
    private String shippingAddress;
}