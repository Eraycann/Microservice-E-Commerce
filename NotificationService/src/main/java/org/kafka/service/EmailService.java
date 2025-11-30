package org.kafka.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.model.NotificationLog;
import org.kafka.repository.NotificationLogRepository;
import org.kafka.service.strategy.NotificationStrategy; // Import
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService implements NotificationStrategy { // Implement ettik

    private final JavaMailSender javaMailSender;
    private final NotificationLogRepository logRepository;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Override
    public String getChannelName() {
        return "EMAIL";
    }

    @Override
    public void send(String to, String subject, String content, String userId) {
        // Mevcut sendHtmlEmail kodunun aynısı buraya gelecek...
        // Sadece metod ismi 'send' oldu.
        String status = "SENT";
        String errorMsg = null;

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);

            javaMailSender.send(message);
            log.info("📧 Mail gönderildi: {}", to);

        } catch (Exception e) {
            log.error("❌ Mail hatası: {}", e.getMessage());
            status = "FAILED";
            errorMsg = e.getMessage();
            throw new RuntimeException("Mail gönderilemedi"); // Retry için hata fırlat
        } finally {
            // Loglama
            logRepository.save(NotificationLog.builder()
                    .userId(userId)
                    .toEmail(to)
                    .subject(subject)
                    .channel(getChannelName())
                    .status(status)
                    .errorMessage(errorMsg)
                    .sentAt(Instant.now())
                    .build());
        }
    }
}