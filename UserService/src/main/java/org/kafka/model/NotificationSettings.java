package org.kafka.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettings {

    // Varsayılan olarak Email ve Push açık, SMS kapalı gelsin.
    // KVKK gereği SMS için genelde açık rıza (Explicit Consent) ayrıca alınır.

    @Builder.Default
    private boolean emailEnabled = true;

    @Builder.Default
    private boolean smsEnabled = false;

    @Builder.Default
    private boolean pushEnabled = true;

    // İleride buraya "campaignsEnabled", "orderStatusEnabled" gibi detaylar da eklenebilir.
}