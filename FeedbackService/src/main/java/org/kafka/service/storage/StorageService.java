package org.kafka.service.storage;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface StorageService {
    // Dosyaları alır, kaydeder ve erişim linklerini (URL) döner
    List<String> uploadImages(List<MultipartFile> images);
}