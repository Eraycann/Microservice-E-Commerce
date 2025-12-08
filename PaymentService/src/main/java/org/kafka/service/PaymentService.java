package org.kafka.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.dto.PaymentRequest;
import org.kafka.model.Payment;
import org.kafka.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Transactional
    public boolean processPayment(PaymentRequest request) {
        log.info("💳 Ödeme isteği alındı. Order: {}, Tutar: {}", request.getOrderNumber(), request.getAmount());

        // 1. IDEMPOTENCY KONTROLÜ
        // Eğer bu sipariş için zaten BAŞARILI bir ödeme varsa, tekrar çekim yapma, TRUE dön.
        // Bu, Order Service retry yaparsa mükerrer ödemeyi engeller.
        if (paymentRepository.existsByOrderNumberAndStatus(request.getOrderNumber(), "SUCCESS")) {
            log.warn("⚠️ Bu sipariş için zaten ödeme alınmış! Mükerrer işlem engellendi.");
            return true;
        }

        // 2. SİMÜLASYON MANTIĞI
        // Gerçek hayatta burada Iyzico/Stripe API çağrılır.
        // Test için: Tutar 10.000 TL'den büyükse YETERSİZ BAKİYE hatası verelim.
        boolean isSuccess = request.getAmount().doubleValue() < 10000;

        // 3. KAYIT
        Payment payment = Payment.builder()
                .userId(request.getUserId())
                .orderNumber(request.getOrderNumber())
                .amount(request.getAmount())
                .status(isSuccess ? "SUCCESS" : "FAILED")
                .transactionReference(UUID.randomUUID().toString()) // Banka referans no simülasyonu
                .build();

        paymentRepository.save(payment);

        if (isSuccess) {
            log.info("✅ Ödeme Başarılı. Ref: {}", payment.getTransactionReference());
        } else {
            log.error("❌ Ödeme Başarısız! (Limit Yetersiz Simülasyonu)");
        }

        return isSuccess;
    }
}