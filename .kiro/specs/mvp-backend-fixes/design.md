# MVP Backend Fixes - Design Document

## Overview

Bu tasarım, e-commerce MVP'si için kritik backend sorunlarını çözmek ve eksik özellikleri tamamlamak amacıyla geliştirilmiştir. Mevcut mikroservis mimarisini koruyarak, minimum değişiklikle maksimum etki sağlayacak çözümler önerilmektedir.

## Architecture

### Mevcut Mikroservis Yapısı
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │  ProductService │
│   (React)       │◄──►│   (Spring)      │◄──►│   (Spring)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                │                        ▼
                                │               ┌─────────────────┐
                                │               │   S3 Storage    │
                                │               │   (AWS)         │
                                │               └─────────────────┘
                                ▼
                       ┌─────────────────┐
                       │ FeedbackService │
                       │   (Spring)      │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   (Questions)   │
                       └─────────────────┘
```

### Hedef Çözüm Mimarisi
- ProductService: Resim yükleme endpoint'i düzeltilecek
- FeedbackService: Soru-cevap API'leri düzeltilecek
- Frontend: Multipart form desteği eklenecek
- S3 Integration: Resim depolama optimize edilecek

## Components and Interfaces

### 1. ProductService Düzeltmeleri

#### ProductController Güncellemeleri
```java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@PreAuthorize("hasRole('superuser')")
public ResponseEntity<ProductDetailResponseDto> createProduct(
    @RequestPart("data") @Valid ProductCreateRequestDto request,
    @RequestPart(value = "images", required = false) List<MultipartFile> images
)
```

**Sorun:** Frontend JSON gönderirken backend multipart bekliyor
**Çözüm:** İki endpoint sağlanacak:
1. `/api/v1/products` (JSON) - Basit ürün oluşturma
2. `/api/v1/products/with-images` (Multipart) - Resimli ürün oluşturma

#### Yeni Endpoint Tasarımı
```java
// Basit ürün oluşturma (JSON)
@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<ProductDetailResponseDto> createProductSimple(
    @Valid @RequestBody ProductCreateRequestDto request
)

// Resimli ürün oluşturma (Multipart)
@PostMapping(value = "/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<ProductDetailResponseDto> createProductWithImages(
    @RequestPart("data") @Valid ProductCreateRequestDto request,
    @RequestPart("images") List<MultipartFile> images
)
```

### 2. FeedbackService Düzeltmeleri

#### QuestionController HTTP Method Sorunu
**Mevcut:** `@PutMapping("/{questionId}/answer")`
**Sorun:** Frontend POST bekliyor
**Çözüm:** Her iki method'u da destekle

```java
@PostMapping("/{questionId}/answer")
@PreAuthorize("hasRole('superuser')")
public ProductQuestion answerQuestionPost(
    @AuthenticationPrincipal Jwt jwt,
    @PathVariable String questionId,
    @RequestBody AnswerRequest request
)

@PutMapping("/{questionId}/answer") 
@PreAuthorize("hasRole('superuser')")
public ProductQuestion answerQuestionPut(
    @AuthenticationPrincipal Jwt jwt,
    @PathVariable String questionId,
    @RequestBody AnswerRequest request
)
```

#### Pagination Standardizasyonu
**Sorun:** Frontend farklı pagination formatı bekliyor
**Çözüm:** Response wrapper ekleme

```java
public class PaginatedResponse<T> {
    private List<T> content;
    private int totalPages;
    private long totalElements;
    private int currentPage;
    private int size;
}
```

### 3. Frontend AdminService Güncellemeleri

#### Resim Yükleme Desteği
```typescript
// Basit ürün oluşturma
async createProduct(request: ProductCreateRequest): Promise<Product>

// Resimli ürün oluşturma  
async createProductWithImages(
  request: ProductCreateRequest, 
  images: File[]
): Promise<Product>
```

#### Form Data Handling
```typescript
const createProductWithImages = async (data: ProductCreateRequest, images: File[]) => {
  const formData = new FormData()
  formData.append('data', JSON.stringify(data))
  images.forEach(image => formData.append('images', image))
  
  return apiClient.post('/api/v1/products/with-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
```

## Data Models

### ProductCreateRequestDto (Backend)
```java
public class ProductCreateRequestDto {
    @NotBlank private String name;
    @NotBlank private String description;
    @NotNull @DecimalMin("0.01") private BigDecimal price;
    @NotNull private Long categoryId;
    @NotNull private Long brandId;
    @Min(0) private Integer initialStockCount = 0;
    @NotNull private String specsData = "{}";
}
```

### ProductCreateRequest (Frontend)
```typescript
interface ProductCreateRequest {
  name: string
  description: string
  price: number
  categoryId: number
  brandId: number
}

interface ProductCreateWithImagesRequest extends ProductCreateRequest {
  images?: File[]
}
```

### QuestionResponse Standardization
```java
public class QuestionResponse {
    private String id;
    private String productId;
    private String questionText;
    private String answerText;
    private String userFullName;
    private String answeredBy;
    private Instant askDate;
    private Instant answerDate;
}
```

## Error Handling

### Standardized Error Response
```java
public class ApiErrorResponse {
    private String error;
    private String message;
    private int status;
    private String timestamp;
    private String path;
}
```

### Error Scenarios
1. **Resim Yükleme Hataları**
   - Dosya boyutu aşımı: 413 Payload Too Large
   - Geçersiz format: 400 Bad Request
   - S3 bağlantı hatası: 503 Service Unavailable

2. **Soru-Cevap Hataları**
   - Soru bulunamadı: 404 Not Found
   - Zaten cevaplandı: 409 Conflict
   - Yetki hatası: 403 Forbidden

3. **Validation Hataları**
   - Eksik alan: 400 Bad Request
   - Geçersiz format: 422 Unprocessable Entity

## Testing Strategy

### Unit Tests
- ProductService: Ürün oluşturma ve resim yükleme
- QuestionService: Soru cevaplama ve listeleme
- S3Service: Dosya yükleme ve URL oluşturma

### Integration Tests
- API endpoint'leri: HTTP method ve response format
- Database operations: CRUD işlemleri
- File upload: Multipart handling

### Property-Based Tests

#### Property 1: Ürün Oluşturma Tutarlılığı
*For any* valid ProductCreateRequest, creating a product should return a product with the same basic information
**Validates: Requirements 1.1, 1.4**

#### Property 2: Resim URL Geçerliliği
*For any* uploaded image file, the returned URL should be accessible and serve the correct image
**Validates: Requirements 5.4**

#### Property 3: Soru Cevaplama İdempotency
*For any* question, answering it multiple times with the same answer should not change the result
**Validates: Requirements 2.2, 2.3**

#### Property 4: Pagination Tutarlılığı
*For any* valid page request, the returned pagination metadata should be mathematically correct
**Validates: Requirements 3.4**

#### Property 5: Error Response Formatı
*For any* API error, the response should follow the standardized error format
**Validates: Requirements 6.2**

### Manual Testing Scenarios
1. **Resim Yükleme Testi**
   - Tek resim yükleme
   - Çoklu resim yükleme
   - Büyük dosya yükleme
   - Geçersiz format yükleme

2. **Soru-Cevap Testi**
   - Soru listeleme
   - Soru cevaplama
   - Cevaplanan soruları görüntüleme
   - Pagination testi

3. **Cross-Browser Testi**
   - Chrome, Firefox, Safari
   - Mobile responsive test
   - File upload compatibility

## Implementation Priority

### Phase 1: Critical Fixes (Immediate)
1. ProductController JSON endpoint ekleme
2. QuestionController POST method desteği
3. Frontend AdminService güncellemeleri

### Phase 2: Image Upload (Week 1)
1. Multipart endpoint implementation
2. S3Service optimization
3. Frontend image upload UI

### Phase 3: Enhancements (Week 2)
1. Error handling standardization
2. Pagination improvements
3. Performance optimizations

### Phase 4: Testing & Documentation (Week 3)
1. Comprehensive test suite
2. API documentation
3. Deployment guides

## Performance Considerations

### File Upload Optimization
- Maximum file size: 5MB per image
- Supported formats: JPEG, PNG, WebP
- Concurrent upload limit: 5 images
- S3 multipart upload for large files

### Database Query Optimization
- Question pagination with proper indexing
- Product search with caching
- Connection pooling configuration

### Caching Strategy
- Product details: Redis cache (1 hour TTL)
- Question lists: Application cache (15 minutes TTL)
- Image URLs: CDN caching (24 hours TTL)

## Security Considerations

### File Upload Security
- File type validation
- Virus scanning integration
- Size limit enforcement
- Secure file naming

### API Security
- JWT token validation
- Role-based access control
- Rate limiting
- Input sanitization

### Data Protection
- Sensitive data masking
- Audit logging
- HTTPS enforcement
- CORS configuration