# MVP Backend Fixes - Requirements Document

## Introduction

Bu spec, e-commerce MVP'si için kritik backend sorunlarını çözmek ve eksik endpoint'leri tamamlamak amacıyla oluşturulmuştur. Kullanıcı feedback'i doğrultusunda aşağıdaki sorunlar tespit edilmiştir:

1. Ürün ekleme sırasında resim yükleme özelliği eksik
2. Soru-cevap sistemi çalışmıyor (sorular boş listeleniyor, cevaplama işlemi etkisiz)
3. Mikroservisler arası entegrasyon sorunları

## Glossary

- **ProductService**: Ürün, kategori, marka ve resim yönetiminden sorumlu mikroservis
- **FeedbackService**: Soru-cevap ve değerlendirme sisteminden sorumlu mikroservis
- **AdminService**: Frontend'de admin işlemleri için kullanılan servis katmanı
- **MVP**: Minimum Viable Product - En temel işlevselliği sağlayan ürün versiyonu
- **MultipartFile**: Spring Boot'ta dosya yükleme için kullanılan veri tipi
- **S3Service**: AWS S3 ile dosya depolama işlemlerini yöneten servis

## Requirements

### Requirement 1: Ürün Resim Yükleme Sistemi

**User Story:** Admin olarak, ürün oluştururken resim yükleyebilmek istiyorum, böylece ürünlerin görsel olarak tanıtılabilmesini sağlayabilirim.

#### Acceptance Criteria

1. WHEN admin ürün oluşturma formunu doldurur ve resim seçer THEN sistem resimlerle birlikte ürünü oluşturmalı
2. WHEN ürün oluşturma isteği gönderilir THEN sistem multipart/form-data formatını kabul etmeli
3. WHEN resimler yüklenir THEN sistem resimleri S3'e kaydetmeli ve URL'lerini veritabanında saklamalı
4. WHEN ürün başarıyla oluşturulur THEN sistem ürün detaylarını resim URL'leriyle birlikte döndürmeli
5. WHEN geçersiz resim formatı yüklenir THEN sistem uygun hata mesajı vermeli

### Requirement 2: Soru-Cevap Sistemi Düzeltmeleri

**User Story:** Admin olarak, kullanıcıların sorduğu soruları görebilmek ve cevaplayabilmek istiyorum, böylece müşteri hizmetleri sağlayabilirim.

#### Acceptance Criteria

1. WHEN admin soru yönetimi sayfasını açar THEN sistem cevaplanmamış soruları listelemelidir
2. WHEN admin bir soruyu cevaplar THEN sistem cevabı kaydedip soru durumunu güncellemeli
3. WHEN soru cevaplandıktan sonra THEN sistem güncellenmiş soru listesini döndürmeli
4. WHEN kullanıcı ürün sayfasında soruları görüntüler THEN sistem cevaplanan soruları göstermeli
5. WHEN soru servisi çağrıldığında THEN sistem doğru HTTP status kodları döndürmeli

### Requirement 3: Frontend-Backend Entegrasyon İyileştirmeleri

**User Story:** Geliştirici olarak, frontend ve backend arasındaki veri formatı uyumsuzluklarını çözmek istiyorum, böylece API çağrıları başarılı olabilir.

#### Acceptance Criteria

1. WHEN frontend ürün oluşturma isteği gönderir THEN backend beklenen veri formatını kabul etmeli
2. WHEN soru cevaplama isteği gönderilir THEN backend doğru HTTP method'unu desteklemeli
3. WHEN API hataları oluşur THEN sistem anlamlı hata mesajları döndürmeli
4. WHEN pagination kullanılır THEN sistem tutarlı sayfalama formatı kullanmalı
5. WHEN CORS ayarları yapılır THEN frontend istekleri başarılı olmalı

### Requirement 4: Admin Dashboard İstatistikleri

**User Story:** Admin olarak, dashboard'da sistem istatistiklerini görebilmek istiyorum, böylece işletme durumunu takip edebilirim.

#### Acceptance Criteria

1. WHEN admin dashboard'u açar THEN sistem toplam ürün sayısını göstermeli
2. WHEN istatistikler yüklenir THEN sistem cevaplanmamış soru sayısını göstermeli
3. WHEN servis erişilemez durumda THEN sistem fallback değerleri göstermeli
4. WHEN istatistik endpoint'leri çağrılır THEN sistem performanslı yanıt vermeli
5. WHEN cache kullanılır THEN sistem güncel verileri göstermeli

### Requirement 5: Dosya Yükleme ve Depolama

**User Story:** Sistem olarak, yüklenen resimleri güvenli şekilde depolayabilmek istiyorum, böylece ürün görselleri erişilebilir olabilir.

#### Acceptance Criteria

1. WHEN resim yüklenir THEN sistem dosya boyutu kontrolü yapmalı
2. WHEN resim formatı kontrol edilir THEN sistem sadece geçerli formatları kabul etmeli
3. WHEN S3'e yükleme yapılır THEN sistem unique dosya adları oluşturmalı
4. WHEN resim URL'i oluşturulur THEN sistem erişilebilir URL döndürmeli
5. WHEN yükleme başarısız olur THEN sistem uygun hata yönetimi yapmalı

### Requirement 6: API Endpoint Standardizasyonu

**User Story:** Geliştirici olarak, tüm API endpoint'lerinin tutarlı format kullanmasını istiyorum, böylece entegrasyon sorunları minimize olabilir.

#### Acceptance Criteria

1. WHEN API response döndürülür THEN sistem tutarlı JSON formatı kullanmalı
2. WHEN hata oluşur THEN sistem standardize edilmiş hata formatı döndürmeli
3. WHEN pagination kullanılır THEN sistem aynı sayfalama yapısını kullanmalı
4. WHEN HTTP status kodları döndürülür THEN sistem REST standartlarına uymalı
5. WHEN API documentation oluşturulur THEN sistem Swagger/OpenAPI kullanmalı