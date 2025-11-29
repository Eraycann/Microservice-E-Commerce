package org.kafka.cartService.model;

import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cart {
    private String userId; // Keycloak ID veya User ID
    private List<CartItem> items = new ArrayList<>();
    private BigDecimal totalCartPrice; // Tüm sepetin toplamı
}
