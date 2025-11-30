package org.kafka.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.model.NotificationLog;
import org.kafka.repository.NotificationLogRepository;
import org.kafka.service.strategy.NotificationStrategy;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService implements NotificationStrategy {

    private final NotificationLogRepository logRepository;

    @Override
    public String getChannelName() {
        return "SMS";
    }

    @Override
    public void send(String to, String subject, String content, String userId) {
        // Twilio veya AWS SNS entegrasyonu buraya gelecek.
        // Şimdilik sadece log atıyoruz.
        log.info("📱 SMS Gönderildi (Simülasyon): {} -> Mesaj: {}", to, content);

        // Log kaydı
        logRepository.save(NotificationLog.builder()
                .userId(userId)
                .toEmail(to) // SMS için telefon no buraya yazılabilir
                .channel(getChannelName())
                .status("SENT")
                .sentAt(Instant.now())
                .build());
    }
}