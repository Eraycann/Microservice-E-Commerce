package org.kafka.service;

import lombok.RequiredArgsConstructor;
import org.kafka.dto.ProductImageOrderUpdateDto;
import org.kafka.dto.ProductImageResponseDto;
import org.kafka.model.Product;
import org.kafka.model.ProductImage;
import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.code.ProductErrorCode;
import org.kafka.mapper.ProductMapper;
import org.kafka.repository.ProductImageRepository;
import org.kafka.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageService {

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final S3Service s3Service;
    private final ProductMapper productMapper;

    @Transactional
    public ProductImageResponseDto addImageToProduct(Long productId, MultipartFile imageFile) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        if (imageFile.isEmpty()) {
            throw new BaseDomainException(ProductErrorCode.INVALID_IMAGE_FILE);
        }

        // 1. S3'e Yükleme
        String url = s3Service.uploadFile(imageFile);

        // 2. Sıra Belirleme (Repository'den max sırayı çekiyor)
        Integer maxOrder = imageRepository.findMaxDisplayOrderByProductId(productId).orElse(0);

        // 3. Entity Oluşturma
        ProductImage newImage = new ProductImage();
        newImage.setProduct(product);
        newImage.setUrl(url);
        newImage.setDisplayOrder(maxOrder + 1);
        newImage.setMain(maxOrder == 0); // Ürünün hiç resmi yoksa, bu resmi ana resim yap.

        ProductImage savedImage = imageRepository.save(newImage);
        return productMapper.toImageDto(savedImage);
    }

    @Transactional
    public void deleteImage(Long imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.IMAGE_NOT_FOUND));

        s3Service.deleteFile(image.getUrl());
        imageRepository.delete(image);
    }

    @Transactional
    public void updateImageOrderAndMainFlag(Long productId, List<ProductImageOrderUpdateDto> updates) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        // Tüm resimleri çekme
        List<ProductImage> existingImages = imageRepository.findByProductId(productId);

        boolean mainFlagFound = false;

        for (ProductImageOrderUpdateDto updateDto : updates) {
            ProductImage imageToUpdate = existingImages.stream()
                    .filter(img -> img.getId().equals(updateDto.getImageId()))
                    .findFirst()
                    .orElseThrow(() -> new BaseDomainException(ProductErrorCode.IMAGE_NOT_FOUND));

            imageToUpdate.setDisplayOrder(updateDto.getDisplayOrder());
            imageToUpdate.setMain(updateDto.isMain());

            if (updateDto.isMain()) {
                mainFlagFound = true;
            }
        }

        // Kural Kontrolü
        if (existingImages.isEmpty() || !mainFlagFound) {
            throw new BaseDomainException(ProductErrorCode.NO_MAIN_IMAGE_SPECIFIED);
        }

        imageRepository.saveAll(existingImages);
    }
}