package org.kafka.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.Instant;

@Data
public abstract class BaseEntity {
    @CreatedDate
    private Instant createdAt; // Kayıt anı (Otomatik dolar)

    @LastModifiedDate
    private Instant updatedAt; // Güncelleme anı (Otomatik dolar)
}