package org.kafka.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Builder
@Document(collection = "notification_logs")
public class NotificationLog {
    @Id
    private String id;

    private String userId;      // Kime?
    private String toEmail;     // Hangi adrese?
    private String subject;     // Konu ne?
    private String channel;     // EMAIL, SMS, PUSH
    private String status;      // SENT, FAILED
    private String errorMessage;// Hata varsa ne?

    private Instant sentAt;
}