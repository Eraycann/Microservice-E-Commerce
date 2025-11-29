package org.kafka.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.model.NotificationLog;
import org.kafka.repository.NotificationLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final NotificationLogRepository logRepository;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendHtmlEmail(String to, String subject, String htmlContent, String userId) {
        String status = "SENT";
        String errorMsg = null;

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            // Multipart true -> HTML içerik ve ek dosya (attachment) destekler
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = isHtml

            javaMailSender.send(message);
            log.info("📧 Mail başarıyla gönderildi: {}", to);

        } catch (MessagingException e) {
            log.error("❌ Mail gönderme hatası: {}", e.getMessage());
            status = "FAILED";
            errorMsg = e.getMessage();
        } finally {
            // Loglama (Audit)
            NotificationLog notifLog = NotificationLog.builder()
                    .userId(userId)
                    .toEmail(to)
                    .subject(subject)
                    .channel("EMAIL")
                    .status(status)
                    .errorMessage(errorMsg)
                    .sentAt(Instant.now())
                    .build();
            logRepository.save(notifLog);
        }
    }
}