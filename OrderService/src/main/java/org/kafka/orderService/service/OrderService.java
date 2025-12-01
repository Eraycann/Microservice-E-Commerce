package org.kafka.orderService.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.cartService.model.Cart;
import org.kafka.cartService.service.CartService;
import org.kafka.exception.base.BaseDomainException; // Import
import org.kafka.exception.code.OrderErrorCode;     // Import
import org.kafka.orderService.client.PaymentServiceClient;
import org.kafka.orderService.client.ProductServiceClient;
import org.kafka.orderService.dto.OrderResponse;
import org.kafka.orderService.dto.PaymentRequest;
import org.kafka.orderService.enums.OrderStatus;
import org.kafka.orderService.event.OrderEventPublisher;
import org.kafka.orderService.model.Order;
import org.kafka.orderService.model.OrderItem;
import org.kafka.orderService.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductServiceClient productServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final OrderEventPublisher eventPublisher;

    @Transactional
    public OrderResponse placeOrder(String userId, String email, String fullName, String shippingAddress) {
        // 1. Sepeti Getir ve Kontrol Et
        Cart cart = cartService.getCart(userId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            // ESKİSİ: throw new RuntimeException("Sepetiniz boş!");
            // YENİSİ:
            throw new BaseDomainException(OrderErrorCode.EMPTY_CART);
        }

        // 2. Sipariş Taslağı
        Order order = Order.builder()
                .userId(userId)
                .orderNumber(UUID.randomUUID().toString())
                .status(OrderStatus.PENDING)
                .totalPrice(cart.getTotalCartPrice())
                .shippingAddress(shippingAddress)
                .build();

        // CartItem -> OrderItem Dönüşümü
        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> OrderItem.builder()
                .productId(String.valueOf(cartItem.getProductId()))
                .productName(cartItem.getProductName())
                .price(cartItem.getPrice())
                .quantity(cartItem.getQuantity())
                .order(order)
                .build()).collect(Collectors.toList());

        order.setItems(orderItems);
        orderRepository.save(order);

        // --- SAGA BAŞLIYOR ---
        try {
            // ADIM 3: Stok Düş
            for (OrderItem item : orderItems) {
                // Not: ProductService 400 dönerse FeignException fırlatır.
                // İleride Feign ErrorDecoder ile bunu yakalayıp INSUFFICIENT_STOCK hatasına çevirebiliriz.
                productServiceClient.reduceStock(item.getProductId(), item.getQuantity());
            }

            // ADIM 4: Ödeme Al
            PaymentRequest paymentRequest = new PaymentRequest(userId, order.getTotalPrice().doubleValue(), order.getOrderNumber());
            boolean paymentSuccess = paymentServiceClient.processPayment(paymentRequest);

            if (!paymentSuccess) {
                // ESKİSİ: throw new RuntimeException("Ödeme alınamadı!");
                // YENİSİ:
                throw new BaseDomainException(OrderErrorCode.PAYMENT_FAILED);
            }

            // ADIM 5: Başarı
            order.setStatus(OrderStatus.APPROVED);
            orderRepository.save(order);

            cartService.clearCart(userId);
            eventPublisher.publishOrderEvents(order, email, fullName);

            log.info("Sipariş tamamlandı: {}", order.getOrderNumber());

        } catch (Exception e) {
            log.error("Sipariş hatası (Rollback): {}", e.getMessage());

            // --- ROLLBACK (Stok İadesi) ---
            try {
                for (OrderItem item : orderItems) {
                    productServiceClient.restoreStock(item.getProductId(), item.getQuantity());
                }
            } catch (Exception ex) {
                log.error("KRİTİK HATA: Stok iadesi başarısız! {}", ex.getMessage());
                // Burada ROLLBACK_FAILED fırlatmak yerine loglayıp devam ediyoruz,
                // çünkü asıl hata siparişin oluşamamasıdır.
            }

            order.setStatus(OrderStatus.FAILED);
            orderRepository.save(order);

            // Eğer yakalanan hata zaten bizim Domain hatamızsa (örn: PAYMENT_FAILED), aynen fırlat.
            if (e instanceof BaseDomainException) {
                throw e;
            }

            // Bilinmeyen bir hataysa (örn: NullPointer, DB hatası) genel hata fırlat.
            throw new BaseDomainException(OrderErrorCode.ORDER_CREATION_FAILED);
        }

        return mapToResponse(order);
    }

    public Page<OrderResponse> getUserOrders(String userId, Pageable pageable) {
        return orderRepository.findAllByUserId(userId, pageable).map(this::mapToResponse);
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .totalPrice(order.getTotalPrice())
                .itemCount(order.getItems() != null ? order.getItems().size() : 0)
                .createdAt(order.getCreatedAt())
                .build();
    }
}