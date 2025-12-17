package org.kafka.service;

import lombok.RequiredArgsConstructor;
import org.kafka.dto.ProductCartDetailDto;
import org.kafka.dto.ProductCreateRequestDto;
import org.kafka.dto.ProductDetailResponseDto;
import org.kafka.dto.ProductUpdateRequestDto;
import org.kafka.exception.base.BaseDomainException;
import org.kafka.exception.code.ProductErrorCode;
import org.kafka.mapper.ProductMapper;
import org.kafka.model.*;
import org.kafka.repository.ProductRepository;
import org.kafka.service.client.MasterDataClient;
import org.kafka.service.helper.DomainHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final MasterDataClient masterDataClient;
    private final S3Service s3Service;
    private final DomainHelper domainHelper;
    private final ProductMapper productMapper;

    // --- YENİ EKLENEN ---
    private final SearchEventPublisher searchEventPublisher;

    // --- CREATE ---

    /**
     * Yeni ürün oluşturur, resimleri S3'e yükler ve ilişkili entityleri (Inventory, Spec, Image) başlatır.
     */
    @Transactional
    public ProductDetailResponseDto  createProduct(ProductCreateRequestDto request,
                                                  List<MultipartFile> images) {

        // 1. Kategori ve Marka Doğrulama (MasterDataClient ile)
        Category category = masterDataClient.getCategoryById(request.getCategoryId());
        Brand brand = masterDataClient.getBrandById(request.getBrandId());

        // 2. Slug Oluşturma ve Benzersizlik Kontrolü
        String slug = domainHelper.generateSlug(request.getName());
        if (productRepository.existsBySlug(slug)) {
            throw new BaseDomainException(ProductErrorCode.PRODUCT_SLUG_ALREADY_EXISTS);
        }

        // 3. Product Entity oluşturma ve ilişkileri set etme
        Product product = productMapper.toEntity(request);
        product.setCategory(category);
        product.setBrand(brand);
        product.setSlug(slug);

        // 4. Alt Entitylerin (Inventory ve Spec) Başlatılması
        product.setInventory(createInitialInventory(product, request.getInitialStockCount()));
        product.setSpecs(createInitialSpecs(product, request.getSpecsData()));

        // ... (Mevcut create işlemleri - validation, saving vs. AYNEN KALIYOR) ...
        // ...
        // 5. Kaydetme
        Product savedProduct = productRepository.save(product);

        // 6. Resimlerin S3'e Yüklenmesi
        List<ProductImage> imageEntities = uploadAndMapImages(savedProduct, images);
        savedProduct.setImages(imageEntities);

        // Veritabanı işlemi bitti, şimdi Search Service'e haber verelim.
        // --- YENİ EKLENEN ---
        searchEventPublisher.sendProductEvent(savedProduct, "CREATE");

        return productMapper.toDetailResponse(savedProduct);
    }

    // --- READ ---

    @Transactional(readOnly = true)
    public ProductDetailResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        return productMapper.toDetailResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductDetailResponseDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        return productMapper.toDetailResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductDetailResponseDto> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return productMapper.toDetailResponseList(products);
    }

    // --- UPDATE ---

    /**
     * Ürünü ID ile günceller (Metinsel alanlar, Category ve Brand ilişkileri).
     * Resim güncellemeleri, ayrı bir endpointte yönetilmelidir.
     */
    @Transactional
    public ProductDetailResponseDto updateProduct(Long id, ProductUpdateRequestDto request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        // 1. Slug Kontrolü (İsim değiştiyse)
        if (request.getName() != null && !product.getName().equals(request.getName())) {
            String newSlug = domainHelper.generateSlug(request.getName());
            if (productRepository.existsBySlug(newSlug)) {
                throw new BaseDomainException(ProductErrorCode.PRODUCT_SLUG_ALREADY_EXISTS);
            }
            product.setSlug(newSlug);
        }

        // 2. İlişki Güncellemeleri
        if (request.getCategoryId() != null) {
            Category category = masterDataClient.getCategoryById(request.getCategoryId());
            product.setCategory(category);
        }
        if (request.getBrandId() != null) {
            Brand brand = masterDataClient.getBrandById(request.getBrandId());
            product.setBrand(brand);
        }

        // 3. Temel Alan Güncellemeleri
        productMapper.updateEntity(product, request);

        // ... (Mevcut update mantığı AYNEN KALIYOR) ...

        Product updatedProduct = productRepository.save(product);

        // --- YENİ EKLENEN ---
        searchEventPublisher.sendProductEvent(updatedProduct, "UPDATE");

        return productMapper.toDetailResponse(updatedProduct);
    }

    // --- DELETE ---

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        // S3'teki resimleri silme
        product.getImages().forEach(img -> s3Service.deleteFile(img.getUrl()));

        // Product silinince, cascade ile bağlı Inventory, Spec ve ProductImage kayıtları da silinir.
        productRepository.delete(product);

        // --- YENİ EKLENEN ---
        // Silinen ürünün verilerini (ID'si önemli) gönderiyoruz
        searchEventPublisher.sendProductEvent(product, "DELETE");
    }

    // --- INTERNAL YARDIMCI METOTLAR ---

    /**
     * ProductInventory entity'sini başlangıç değerleriyle oluşturur.
     */
    private ProductInventory createInitialInventory(Product product, Integer initialStockCount) {
        ProductInventory inventory = new ProductInventory();
        inventory.setProduct(product);
        inventory.setStockCount(initialStockCount != null ? initialStockCount : 0);
        inventory.setLastUpdated(LocalDateTime.now());
        return inventory;
    }

    /**
     * ProductSpec entity'sini başlangıç JSON verisiyle oluşturur.
     */
    private ProductSpec createInitialSpecs(Product product, String specsData) {
        ProductSpec specs = new ProductSpec();
        specs.setProduct(product);
        specs.setSpecsData(specsData);
        return specs;
    }

    /**
     * Dosyaları S3'e yükler ve ProductImage Entity listesini oluşturur.
     * Yüklenen ilk resmi 'Ana Resim' (isMain: true) olarak işaretler.
     */
    private List<ProductImage> uploadAndMapImages(Product product, List<MultipartFile> images) {
        List<ProductImage> imageEntities = new ArrayList<>();
        int order = 1;

        if (images != null && !images.isEmpty()) {
            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String url = s3Service.uploadFile(file);

                    ProductImage img = new ProductImage();
                    img.setProduct(product);
                    img.setUrl(url);
                    img.setDisplayOrder(order++);
                    // Yüklenen ilk resim ana resimdir.
                    img.setMain(imageEntities.isEmpty());

                    imageEntities.add(img);
                }
            }
        }
        return imageEntities;
    }


    // CartService tarafından çağrılan metot
    public ProductCartDetailDto getProductForCart(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        // 1. MapStruct ile temel dönüşümü yap
        ProductCartDetailDto dto = productMapper.toCartDetailDto(product);

        // 2. Özel (Manual) İşlem: Ana resmi bulma
        // Bu mantık Mapper ile zor olduğu için Service katmanında kalır.
        String imageUrl = product.getImages().stream()
                .filter(ProductImage::isMain)
                .findFirst()
                .map(ProductImage::getUrl)
                .orElse(null);

        // 3. DTO'yu eksik bilgiyle tamamla
        dto.setMainImageUrl(imageUrl);

        return dto;
    }

    // --- ProductQueryClient Tarafından Çağrılan Metotlar ---

    @Transactional(readOnly = true)
    public long countByCategoryId(Long categoryId) {
        return productRepository.countByCategoryId(categoryId);
    }

    @Transactional(readOnly = true)
    public long countByBrandId(Long brandId) {
        return productRepository.countByBrandId(brandId);
    }


    //       -------------

    // --- YENİ METOT: VİTRİN YÖNETİMİ ---
    @Transactional
    public ProductDetailResponseDto updateFeaturedStatus(Long id, boolean featured) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BaseDomainException(ProductErrorCode.PRODUCT_NOT_FOUND));

        // Durumu güncelle (Sadece bayrak değişiyor)
        product.setFeatured(featured);
        Product savedProduct = productRepository.save(product);

        // 🚀 RabbitMQ ile Search Service'e haber ver (UPDATE Olayı)
        // Search Service bu mesajı alınca featured bilgisini de güncelleyecek.
        searchEventPublisher.sendProductEvent(savedProduct, "UPDATE");

        return productMapper.toDetailResponse(savedProduct);
    }
}