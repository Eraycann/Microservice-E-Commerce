package org.kafka.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.code.ProductErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    /**
     * Tek bir dosyayı yükler, benzersiz isim verir ve URL'ini döner.
     */
    public String uploadFile(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String fileName = UUID.randomUUID().toString() + extension;

        try {
            PutObjectRequest putOb = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putOb, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Public URL oluşturma (Bölge konfigürasyonunuza göre değişebilir)
            return String.format("https://%s.s3.amazonaws.com/%s", bucketName, fileName);

        } catch (IOException | S3Exception e) {
            log.error("S3 yükleme hatası: {}", e.getMessage(), e);
            throw new BaseDomainException(ProductErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    /**
     * Verilen URL'den dosya adını çıkararak S3'ten dosyayı siler.
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return;

        // URL'den dosya adını (key) çıkarma. Örn: .../bucket-name/fileName -> fileName
        String key = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);
            log.info("S3 dosya silindi: {}", key);
        } catch (S3Exception e) {
            log.error("S3 silme hatası: {}", e.getMessage());
            // Silme işleminin başarısız olması (dosyanın zaten olmaması) kritik bir hata olmayabilir,
            // bu yüzden sadece logluyoruz.
        }
    }
}
