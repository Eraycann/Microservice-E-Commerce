package org.kafka.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.code.FeedbackErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class LocalStorageService implements StorageService {

    // System.getProperty("user.dir") -> Projenin o an çalıştığı kök dizini verir.
    // Sonuna "uploads" ekliyoruz.
    private final Path rootLocation = Paths.get(System.getProperty("user.dir"), "uploads");

    public LocalStorageService() {
        try {
            // Log'a basıyoruz ki nereye kaydettiğini konsoldan gör.
            log.info("Dosya kayıt dizini ayarlandı: {}", rootLocation.toAbsolutePath());
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            log.error("Upload dizini oluşturulamadı!", e);
            throw new RuntimeException("Upload dizini oluşturulamadı!");
        }
    }

    @Override
    public List<String> uploadImages(List<MultipartFile> images) {
        List<String> imageUrls = new ArrayList<>();

        // Resim gelmediyse boş liste dön, hata patlatma
        if (images == null || images.isEmpty()) {
            return imageUrls;
        }

        for (MultipartFile file : images) {
            if (file.isEmpty()) continue;

            // Dosya tipi kontrolü (Resim mi?)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                log.warn("Resim olmayan dosya atlandı: {}", file.getOriginalFilename());
                continue;
            }

            try {
                // Dosya ismini benzersiz yap (çakışma olmasın)
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null) originalFilename = "image.jpg";

                // Güvenli dosya ismi al
                String safeFileName = Paths.get(originalFilename).getFileName().toString();
                String fileName = UUID.randomUUID() + "_" + safeFileName;

                // Hedef dosya yolu
                Path destinationFile = this.rootLocation.resolve(fileName).normalize().toAbsolutePath();

                // Dosyayı diske yaz
                Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

                log.info("Dosya başarıyla yazıldı: {}", destinationFile);

                // Frontend'e dönecek path - Gateway üzerinden erişim
                String imageUrl = "http://localhost:8080/feedback-service/uploads/" + fileName;
                imageUrls.add(imageUrl);
                
                log.info("Image URL created: {}", imageUrl);

            } catch (IOException e) {
                log.error("Dosya kaydedilirken hata oluştu: {}", e.getMessage());
                throw new BaseDomainException(FeedbackErrorCode.IMAGE_UPLOAD_FAILED);
            }
        }
        return imageUrls;
    }
}