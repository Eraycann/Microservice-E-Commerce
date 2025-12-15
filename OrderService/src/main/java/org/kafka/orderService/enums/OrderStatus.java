package org.kafka.orderService.enums;

public enum OrderStatus {
    PENDING,    // Sipariş oluştu, ödeme/stok bekleniyor
    APPROVED,   // Her şey başarılı
    FAILED,     // Ödeme veya Stok hatası
    CANCELLED   // İade durumu (Rollback)
}