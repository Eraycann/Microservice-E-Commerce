# Uygulama Planı: E-Ticaret Frontend

## Genel Bakış

Bu uygulama planı, e-ticaret frontend geliştirmesini ayrık, yönetilebilir görevlere böler. Her görev, önceki çalışmalar üzerine kademeli olarak inşa eder ve her kontrol noktasında işlevsel bir uygulama sağlar. Plan, React 18+, TypeScript, Tailwind CSS ve shadcn/ui bileşenleri ile BFF (Backend for Frontend) mimarisini takip eder.

## Görevler

- [x] 1. Proje Kurulumu ve Temel
  - TypeScript ve React 18+ ile Vite projesini başlat
  - Tailwind CSS'i yapılandır ve shadcn/ui'yi başlat
  - Proje klasör yapısını kur (özellik tabanlı mimari)
  - ESLint, Prettier ve TypeScript strict mode'u yapılandır
  - _Gereksinimler: Teknik Mimari Kılavuzları_

- [x] 2. Temel Altyapı Kurulumu
  - [x] 2.1 API istemcisini axios ile yapılandır
    - src/lib/axios.ts içinde singleton apiClient oluştur
    - withCredentials: true'yu global olarak yapılandır
    - Temel URL'yi http://localhost:8080 olarak ayarla
    - _Gereksinimler: 1.2, Ağ Katmanı Kılavuzları_

  - [x] 2.2 İstek/yanıt interceptor'larını uygula
    - Misafir ID header enjeksiyonu için istek interceptor'ı ekle
    - Global hata işleme için yanıt interceptor'ı ekle
    - 401 kimlik doğrulama hatalarını koşullu yönlendirme ile işle
    - _Gereksinimler: 4.1, 4.2, 10.2_

  - [ ]* 2.3 API istek header yönetimi için özellik testi yaz
    - **Özellik 1: API İstek Header Yönetimi**
    - **Doğrular: Gereksinimler 1.2, 4.1, 4.2, 6.2**

- [x] 3. Durum Yönetimi Kurulumu
  - [x] 3.1 Zustand store'larını yapılandır
    - Kullanıcı kimlik doğrulama durumu için auth store oluştur
    - İstemci tarafı sepet durumu için cart store oluştur
    - Global UI durumu için UI store oluştur (yükleme, hatalar)
    - _Gereksinimler: 1.3, 4.4_

  - [x] 3.2 TanStack Query'yi yapılandır
    - Önbelleğe alma yapılandırması ile QueryClient kur
    - Global sorgu varsayılanları ve hata işlemeyi yapılandır
    - Sorgu geçersizleştirme stratejilerini kur
    - _Gereksinimler: 9.2_

  - [ ]* 3.3 Sepet durumu senkronizasyonu için özellik testi yaz
    - **Özellik 5: Sepet Durumu Senkronizasyonu**
    - **Doğrular: Gereksinimler 4.3, 4.4, 4.5**

- [x] 4. Kimlik Doğrulama Sistemi
  - [x] 4.1 Kimlik doğrulama servisini uygula
    - getCurrentUser, logout, checkAuthStatus metodları ile AuthService oluştur
    - localStorage'da misafir ID oluşturma ve yönetimini uygula
    - Keycloak entegrasyonu için OAuth2 yönlendirme mantığını işle
    - _Gereksinimler: 1.1, 1.4, 4.1_

  - [x] 4.2 Kimlik doğrulama bileşenlerini oluştur
    - Keycloak yönlendirmesi ile LoginButton bileşeni oluştur
    - Kullanıcı bilgi görüntüleme ile UserProfile bileşeni oluştur
    - Kimlik doğrulanmış sayfalar için ProtectedRoute wrapper'ı oluştur
    - _Gereksinimler: 1.1, 1.3_

  - [ ]* 4.3 Kimlik doğrulama durumu yönetimi için özellik testi yaz
    - **Özellik 6: Kimlik Doğrulama Durumu Yönetimi**
    - **Doğrular: Gereksinimler 1.3, 8.1**

- [x] 5. Düzen ve Navigasyon
  - [x] 5.1 Ana düzen bileşenlerini oluştur
    - Header, ana içerik ve footer ile MainLayout oluştur
    - Arama, sepet ikonu, kullanıcı menüsü ile duyarlı Navbar oluştur
    - Site linkleri ile Footer bileşeni oluştur
    - _Gereksinimler: 7.1_

  - [x] 5.2 Navigasyon ve yönlendirmeyi uygula
    - Ana rotalar ile React Router'ı yapılandır
    - Performans için rota tabanlı kod bölme kur
    - Breadcrumb navigasyonu uygula
    - _Gereksinimler: 9.1_

  - [ ]* 5.3 Duyarlı tasarım davranışı için özellik testi yaz
    - **Özellik 7: Duyarlı Tasarım Davranışı**
    - **Doğrular: Gereksinimler 7.1**

- [x] 6. Ürün Kataloğu Sistemi
  - [x] 6.1 Ürün servisi ve veri modellerini oluştur
    - Tüm CRUD işlemleri ile ProductService uygula
    - Product, Category, Brand modelleri için TypeScript arayüzleri tanımla
    - Resim URL işleme için yardımcı fonksiyonlar oluştur
    - _Gereksinimler: 2.2, 2.3, Resim İşleme Kılavuzları_

  - [x] 6.2 Ürün görüntüleme bileşenlerini oluştur
    - Duyarlı ürün listeleri için ProductGrid oluştur
    - Resim, fiyat, puan görüntüleme ile ProductCard oluştur
    - Tam ürün bilgisi ile ProductDetail sayfasını uygula
    - _Gereksinimler: 2.1, 2.4_

  - [x] 6.3 Ürün filtreleme ve kategorileri uygula
    - Çoklu seçim seçenekleri ile CategoryFilter bileşeni oluştur
    - URL tabanlı filtre durumu yönetimini uygula
    - Navigasyon boyunca filtre kalıcılığı oluştur
    - _Gereksinimler: 2.5_

  - [ ]* 6.4 Ürün görüntüleme tamlığı için özellik testi yaz
    - **Özellik 3: Ürün Görüntüleme Tamlığı**
    - **Doğrular: Gereksinimler 2.4**

  - [ ]* 6.5 API endpoint yönlendirmesi için özellik testi yaz
    - **Özellik 2: API Endpoint Yönlendirmesi**
    - **Doğrular: Gereksinimler 2.2, 2.3, 3.1, 3.2, 5.2, 5.3, 6.3, 8.3**

- [x] 7. Arama ve Keşif Özellikleri
  - [x] 7.1 Arama işlevselliğini uygula
    - Otomatik tamamlama ile SearchBar bileşeni oluştur
    - Filtreleme seçenekleri ile arama sonuçları sayfası oluştur
    - API'den arama önerilerini uygula
    - _Gereksinimler: 3.1, 3.2, 3.3_

  - [x] 7.2 Arama sonucu işlemeyi ekle
    - Arama sonuçları için sunucu tarafı sayfalama uygula
    - Sonuç bulunamadığında yedek görüntü oluştur
    - Arama geçmişi ve son aramalar ekle
    - _Gereksinimler: 3.4, 3.5_

  - [x] 7.3 Türkçe yerelleştirme
    - Tüm UI metinlerini Türkçe'ye çevir
    - Hata mesajları ve doğrulama metinlerini yerelleştir
    - Arama yer tutucuları ve etiketleri güncelle
    - _Gereksinimler: Kullanıcı Deneyimi_

  - [ ]* 7.4 Arama ve filtre işlevselliği için özellik testi yaz
    - **Özellik 4: Arama ve Filtre İşlevselliği**
    - **Doğrular: Gereksinimler 2.5, 3.5**

- [ ] 8. Kontrol Noktası - Temel Özellikler Tamamlandı
  - Tüm testlerin geçtiğinden emin ol, temel navigasyonun çalıştığını doğrula
  - Ürün tarama, arama ve filtreleme işlevselliğini test et
  - Kimlik doğrulama akışı ve durum yönetimini doğrula
  - Sorular çıkarsa kullanıcıya sor

- [x] 9. Alışveriş Sepeti Uygulaması ✅ **TAMAMLANDI**
  - [x] 9.1 Sepet servisi ve bileşenlerini oluştur
    - Ekleme, güncelleme, kaldırma, birleştirme işlemleri ile CartService uygula
    - Miktar seçimi ile AddToCartButton oluştur
    - CartDrawer kaydırma bileşeni oluştur
    - Öğe sayısı rozeti ile CartIcon oluştur
    - _Gereksinimler: 4.1, 4.2, 4.3, 4.4_

  - [x] 9.2 Sepet kalıcılığı ve birleştirme mantığını uygula
    - Misafir ve kimlik doğrulanmış kullanıcılar için sepet durumu kalıcılığı ekle
    - Giriş sırasında misafirden kullanıcıya sepet birleştirmeyi uygula
    - Tarayıcı sekmeleri arasında sepet senkronizasyonunu işle
    - _Gereksinimler: 4.3, 4.5, Birleştirme Süreci Kılavuzları_

  - [x] 9.3 Sepet yönetimi sayfasını oluştur
    - Öğe yönetimi ile tam CartPage oluştur
    - Miktar güncellemeleri ve öğe kaldırmayı uygula
    - Sepet toplam hesaplamaları ve vergi görüntüleme ekle
    - _Gereksinimler: 4.4_

  - [x] 9.4 Backend API uyumluluğu ve hata düzeltmeleri
    - CartService'i Backend CartController API'larına uygun hale getir
    - Cart ve CartItem tiplerini Backend DTO'larıyla eşitle
    - CartUtils yardımcı sınıfını oluştur
    - Tüm TypeScript build hatalarını düzelt
    - User ve Address tiplerini Backend modellerine uygun hale getir

  - [ ]* 9.5 Sepet bileşenleri için birim testleri yaz
    - AddToCartButton işlevselliğini test et
    - CartDrawer görüntüleme ve etkileşimlerini test et
    - Oturumlar arası sepet kalıcılığını test et

- [x] 10. Kullanıcı Profili ve Hesap Yönetimi
  - [x] 10.1 Kullanıcı profili bileşenlerini oluştur
    - Düzenlenebilir kullanıcı bilgileri ile UserProfile sayfası oluştur
    - CRUD işlemleri ile adres yönetimini uygula
    - Durum takibi ile sipariş geçmişi görüntüleme oluştur
    - _Gereksinimler: 5.1, 5.2, 5.3, 5.4_

  - [x] 10.2 Kullanıcı servisi entegrasyonunu uygula
    - Profil ve adres yönetimi ile UserService oluştur
    - Sipariş geçmişi çekme ve görüntüleme ekle
    - Profil güncelleme işlevselliğini uygula
    - _Gereksinimler: 5.2, 5.3_

  - [ ]* 10.3 Kullanıcı profili özellikleri için birim testleri yaz
    - Profil düzenleme ve kaydetmeyi test et
    - Adres CRUD işlemlerini test et
    - Sipariş geçmişi görüntülemeyi test et

- [ ] 11. Kişiselleştirilmiş Öneriler
  - [ ] 11.1 Öneri sistemini uygula
    - API entegrasyonu ile RecommendationService oluştur
    - Öneri görüntüleme bileşenlerini oluştur
    - Kullanıcı etkileşim takibini uygula
    - _Gereksinimler: 6.1, 6.2, 6.3_

  - [ ] 11.2 Öneri hata işlemeyi ekle
    - Servis başarısızlığında popüler ürünlere yedeklemeyi uygula
    - Öneri yükleme durumları ekle
    - Öneri yenileme işlevselliği oluştur
    - _Gereksinimler: 6.4_

  - [ ]* 11.3 Öneri özellikleri için birim testleri yaz
    - Öneri görüntüleme ve yedekleme davranışını test et
    - Kullanıcı etkileşim takibini test et
    - Misafir vs kimlik doğrulanmış öneri işlemeyi test et

- [ ] 12. Sipariş İşleme Sistemi
  - [ ] 12.1 Ödeme akışını oluştur
    - Sepet doğrulama ile ödeme sayfası oluştur
    - Kargo adresi toplama uygula
    - Ödeme bilgileri formu oluştur
    - Sipariş inceleme ve onay ekle
    - _Gereksinimler: 8.1, 8.2_

  - [ ] 12.2 Sipariş servisi entegrasyonunu uygula
    - Sipariş oluşturma ve takip ile OrderService oluştur
    - Sipariş onay sayfası ekle
    - Sipariş sonrası sepet temizlemeyi uygula
    - _Gereksinimler: 8.3, 8.4_

  - [ ]* 12.3 Sipariş işleme akışı için özellik testi yaz
    - **Özellik 12: Sipariş İşleme Akışı**
    - **Doğrular: Gereksinimler 8.4**

- [ ] 13. Hata İşleme ve Yükleme Durumları
  - [ ] 13.1 Global hata işlemeyi uygula
    - Hata sınırı bileşenleri oluştur
    - Toast bildirim sistemi oluştur
    - Başarısız istekler için yeniden deneme mantığı ekle
    - _Gereksinimler: 10.1, 10.3_

  - [ ] 13.2 Yükleme ve iskelet durumları ekle
    - Tüm ana bölümler için iskelet bileşenleri oluştur
    - Tüm API işlemleri için yükleme durumları uygula
    - Uzun işlemler için ilerleme göstergeleri ekle
    - _Gereksinimler: 7.3_

  - [ ]* 13.3 Yükleme ve hata durumu görüntüleme için özellik testi yaz
    - **Özellik 8: Yükleme ve Hata Durumu Görüntüleme**
    - **Doğrular: Gereksinimler 7.3, 7.4, 10.1**

  - [ ]* 13.4 Oturum sona erme işleme için özellik testi yaz
    - **Özellik 9: Oturum Sona Erme İşleme**
    - **Doğrular: Gereksinimler 10.2**

  - [ ]* 13.5 İstek yeniden deneme mantığı için özellik testi yaz
    - **Özellik 10: İstek Yeniden Deneme Mantığı**
    - **Doğrular: Gereksinimler 10.3**

- [ ] 14. Performans Optimizasyonu
  - [ ] 14.1 Lazy loading uygula
    - Rota bileşenleri için lazy loading ekle
    - Intersection observer ile resim lazy loading uygula
    - Yer tutucular ile aşamalı resim yükleme oluştur
    - _Gereksinimler: 9.1_

  - [ ] 14.2 Önbelleğe alma ve performansı optimize et
    - TanStack Query önbelleğe alma stratejilerini yapılandır
    - Çevrimdışı işlevsellik için service worker uygula
    - Bundle bölme ve tree shaking optimizasyonu ekle
    - _Gereksinimler: 9.2_

  - [ ]* 14.3 Performans optimizasyonu için özellik testi yaz
    - **Özellik 11: Performans Optimizasyonu**
    - **Doğrular: Gereksinimler 9.1, 9.2**

  - [ ]* 14.4 Lighthouse performans puanı için birim testi yaz
    - **Doğrular: Gereksinimler 9.3**

- [ ] 15. Erişilebilirlik ve Son Cilalama
  - [ ] 15.1 Erişilebilirlik özelliklerini uygula
    - Tüm etkileşimli öğelere ARIA etiketleri ve rolleri ekle
    - Klavye navigasyon desteği uygula
    - Ekran okuyucu desteği ve duyurular ekle
    - Renk kontrastının WCAG 2.1 AA standartlarını karşıladığından emin ol
    - _Gereksinimler: 7.5_

  - [ ] 15.2 Son UI cilalamayı ekle
    - Akıcı animasyonlar ve geçişler uygula
    - Daha iyi UX için mikro etkileşimler ekle
    - Mobil dokunma etkileşimlerini optimize et
    - _Gereksinimler: 7.1_

  - [ ]* 15.3 Erişilebilirlik uyumluluğu için özellik testi yaz
    - **Özellik 13: Erişilebilirlik Uyumluluğu**
    - **Doğrular: Gereksinimler 7.5**

- [ ] 16. Entegrasyon Testi ve Son Doğrulama
  - [ ] 16.1 Uçtan uca test paketi oluştur
    - Taramadan siparişe kadar tam kullanıcı yolculuğunu test et
    - Misafirden kimlik doğrulanmış kullanıcıya akışı doğrula
    - Sepet birleştirme ve kalıcılık senaryolarını test et
    - _Gereksinimler: Tüm işlevsel gereksinimler_

  - [ ] 16.2 Performans ve güvenlik doğrulaması
    - Lighthouse performans denetimlerini çalıştır
    - CSRF token işlemeyi doğrula
    - Oturum yönetimi ve güvenliği test et
    - _Gereksinimler: 1.5, 9.3_

- [ ] 17. Son Kontrol Noktası - Tam Uygulama
  - Tüm testlerin geçtiğinden ve uygulamanın tamamen işlevsel olduğundan emin ol
  - Tüm gereksinimlerin uygulandığını ve çalıştığını doğrula
  - Uygulamayı farklı tarayıcılar ve cihazlarda test et
  - Sorular çıkarsa kullanıcıya sor

## Notlar

- `*` ile işaretlenen görevler isteğe bağlıdır ve daha hızlı MVP için atlanabilir
- Her görev izlenebilirlik için belirli gereksinimlere referans verir
- Kontrol noktaları kademeli doğrulama ve kullanıcı geri bildirimi sağlar
- Özellik testleri evrensel doğruluk özelliklerini doğrular
- Birim testleri belirli örnekleri ve kenar durumları doğrular
- Uygulama boyunca BFF mimari desenini takip eder