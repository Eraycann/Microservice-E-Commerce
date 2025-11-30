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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class LocalStorageService implements StorageService {

    // Proje dizininde "uploads" klasörü oluşturur
    private final Path rootLocation = Paths.get("uploads");

    public LocalStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Upload dizini oluşturulamadı!");
        }
    }

    @Override
    public List<String> uploadImages(List<MultipartFile> images) {
        List<String> imageUrls = new ArrayList<>();

        if (images == null || images.isEmpty()) {
            return imageUrls;
        }

        for (MultipartFile file : images) {
            if (file.isEmpty()) continue;

            // Dosya tipi kontrolü (Basit)
            if (!file.getContentType().startsWith("image/")) {
                throw new BaseDomainException(FeedbackErrorCode.INVALID_IMAGE_TYPE);
            }

            try {
                // Benzersiz isim üret (resim.jpg -> uuid_resim.jpg)
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

                // Dosyayı kaydet: uploads/uuid_resim.jpg
                Files.copy(file.getInputStream(), this.rootLocation.resolve(fileName));

                // Erişilebilir URL formatı (Gerçekte Nginx veya Static Resource Handler arkasında olur)
                // Şimdilik yerel path dönüyoruz
                imageUrls.add("/uploads/" + fileName);

            } catch (IOException e) {
                log.error("Dosya kayıt hatası: {}", e.getMessage());
                throw new BaseDomainException(FeedbackErrorCode.IMAGE_UPLOAD_FAILED);
            }
        }
        return imageUrls;
    }
}