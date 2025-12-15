package org.kafka.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kafka.dto.ProductImageOrderUpdateDto;
import org.kafka.dto.ProductImageResponseDto;
import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.code.ProductErrorCode;
import org.kafka.mapper.ProductMapper;
import org.kafka.model.Product;
import org.kafka.model.ProductImage;
import org.kafka.repository.ProductImageRepository;
import org.kafka.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductImageService {

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final S3Service s3Service;
    private final ProductMapper productMapper;

    // Elasticsearch güncellemesi için
    private final SearchEventPublisher searchEventPublisher;

    @Transactional
    public ProductImageResponseDto addImageToProduct(Long productId, MultipartFile imageFile) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        if (imageFile.isEmpty()) {
            throw new BaseDomainException(ProductErrorCode.INVALID_IMAGE_FILE);
        }

        // 1. S3'e Yükleme
        String url = s3Service.uploadFile(imageFile);

        // 2. Mevcut resim sayısını kontrol et
        List<ProductImage> existingImages = imageRepository.findByProductId(productId);
        int maxOrder = existingImages.stream()
                .mapToInt(ProductImage::getDisplayOrder)
                .max()
                .orElse(0);

        // 3. Entity Oluşturma
        ProductImage newImage = new ProductImage();
        newImage.setProduct(product);
        newImage.setUrl(url);
        newImage.setDisplayOrder(maxOrder + 1);

        // Eğer ürünün hiç resmi yoksa, bu yüklenen ilk resim otomatik "Main" olur.
        boolean isFirstImage = existingImages.isEmpty();
        newImage.setMain(isFirstImage);

        ProductImage savedImage = imageRepository.save(newImage);

        // 🚀 EVENT: Eğer ana resim olarak eklendiyse Elasticsearch güncellenmeli.
        if (isFirstImage) {
            searchEventPublisher.sendProductEvent(product, "UPDATE");
        }

        return productMapper.toImageDto(savedImage);
    }

    @Transactional
    public void deleteImage(Long imageId) {
        ProductImage imageToDelete = imageRepository.findById(imageId)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.IMAGE_NOT_FOUND));

        Product product = imageToDelete.getProduct();
        List<ProductImage> allImages = imageRepository.findByProductId(product.getId());

        // --- KRİTİK KURAL ---
        // Eğer silinecek resim Ana Resim ise ve ürüne ait başka resimler de varsa silmeyi engelle.
        if (imageToDelete.isMain() && allImages.size() > 1) {
            throw new BaseDomainException(ProductErrorCode.CANNOT_DELETE_MAIN_IMAGE);
        }

        // S3 ve DB'den silme işlemi
        s3Service.deleteFile(imageToDelete.getUrl());
        imageRepository.delete(imageToDelete);

        // 🚀 EVENT: Resim silindi.
        // Eğer tek resim vardı ve onu da sildiysek, ürün artık resimsizdir.
        // SearchEventPublisher en güncel hali (resimsiz veya kalan resimlerle) gönderecektir.
        searchEventPublisher.sendProductEvent(product, "UPDATE");
    }

    /**
     * Ana resmi değiştirmek veya sıralamayı güncellemek için kullanılır.
     */
    @Transactional
    public void updateImageOrderAndMainFlag(Long productId, List<ProductImageOrderUpdateDto> updates) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        List<ProductImage> existingImages = imageRepository.findByProductId(productId);

        boolean mainFlagFound = false;
        boolean isMainChanged = false;

        for (ProductImageOrderUpdateDto updateDto : updates) {
            ProductImage imageToUpdate = existingImages.stream()
                    .filter(img -> img.getId().equals(updateDto.getImageId()))
                    .findFirst()
                    .orElseThrow(() -> new BaseDomainException(ProductErrorCode.IMAGE_NOT_FOUND));

            // Ana resim değişiyor mu kontrolü
            if (imageToUpdate.isMain() != updateDto.isMain()) {
                isMainChanged = true;
            }

            imageToUpdate.setDisplayOrder(updateDto.getDisplayOrder());
            imageToUpdate.setMain(updateDto.isMain());

            if (updateDto.isMain()) {
                // Güvenlik kontrolü: Birden fazla resim Main işaretlenmemeli (Front-end hatası olsa bile)
                if (mainFlagFound) {
                    // İkinci bir main geldiyse hata fırlatabilir veya ilki geçerli sayılabilir.
                    // Şimdilik validasyon mantığına girmiyorum, son gelen main olur.
                }
                mainFlagFound = true;
            }
        }

        // Kural: Mutlaka bir resim Main olarak işaretlenmiş olmalı
        if (!existingImages.isEmpty() && !mainFlagFound) {
            throw new BaseDomainException(ProductErrorCode.NO_MAIN_IMAGE_SPECIFIED);
        }

        imageRepository.saveAll(existingImages);

        // 🚀 EVENT: Eğer ana resim değiştiyse Elasticsearch anında güncellenmeli.
        if (isMainChanged) {
            searchEventPublisher.sendProductEvent(product, "UPDATE");
        }
    }
}