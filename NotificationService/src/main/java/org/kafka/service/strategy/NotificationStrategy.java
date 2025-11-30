package org.kafka.service.strategy;

import org.kafka.model.NotificationLog;

public interface NotificationStrategy {

    // Bu strateji hangi kanalı destekliyor? (EMAIL, SMS, PUSH)
    String getChannelName();

    // Bildirimi gönder
    void send(String to, String subject, String content, String userId);
}