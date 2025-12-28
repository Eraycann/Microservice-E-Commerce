# Gereksinimler Dökümanı

## Giriş

Modern, minimalist ve ölçeklenebilir e-ticaret frontend uygulaması. Güvenli, performanslı ve SEO dostu alışveriş deneyimi sağlamak için mikroservis mimarisi ile Backend for Frontend (BFF) desenini kullanır. Uygulama, kesintisiz kullanıcı deneyimi sağlamak için kullanıcı kimlik doğrulama durumunu ve misafir oturumlarını yönetir.

## Sözlük
- **BFF**: API Gateway üzerinden tüm mikroservislere erişim sağlayan, token yönetimini backend'de gerçekleştiren Backend for Frontend deseni
- **Misafir_Kullanıcı**: Yerel olarak oluşturulan UUID (X-Guest-Id) ile takip edilen kimlik doğrulaması yapılmamış kullanıcı
- **Kimlik_Doğrulanmış_Kullanıcı**: Keycloak üzerinden giriş yapmış, JSESSIONID cookie'si ile takip edilen kullanıcı
- **Birleştirme_Süreci**: Kullanıcı giriş yaptığında misafir sepetinin kimlik doğrulanmış kullanıcı sepetine aktarılması süreci
- **Oturum_Yönetimi**: HttpOnly cookie'lere dayalı güvenli oturum yönetimi (Frontend JWT görmez)
- **Frontend**: E-ticaret istemci uygulaması
- **API_Gateway**: İstekleri mikroservislere yönlendiren backend servisi

## Gereksinimler

### Gereksinim 1: Kimlik Doğrulama ve Oturum Yönetimi

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, token'ları doğrudan işlemeden kişiselleştirilmiş özelliklere erişebilmek için güvenli bir şekilde giriş yapmak ve oturumumu sürdürmek istiyorum.

#### Kabul Kriterleri

1. Kullanıcı giriş yap'a tıkladığında, Frontend tarayıcıyı http://localhost:8080/oauth2/authorization/keycloak adresine yönlendirmelidir
2. API istekleri yaparken, Frontend tüm axios çağrılarında global olarak withCredentials: true içermelidir
3. Kullanıcı kimlik doğrulandığında, Frontend HttpOnly Session Cookie'sine dayanarak kullanıcıya özel içerik görüntülemelidir
4. Kullanıcı çıkış yaptığında, Frontend backend oturumunu temizlemek için /logout endpoint'ine yönlendirmelidir
5. Frontend CSRF token'larını cookie'ler aracılığıyla otomatik olarak işlemelidir (XSRF-TOKEN)

### Gereksinim 2: Ürün Kataloğu Görüntüleme

**Kullanıcı Hikayesi:** Bir ziyaretçi olarak, satın almak istediğim ürünleri keşfedebilmek için ürünlere, kategorilere ve markalara göz atmak istiyorum.

#### Kabul Kriterleri

1. Ana sayfa yüklendiğinde, Frontend /api/v1/search/featured adresinden vitrin ürünlerini görüntülemelidir
2. Kullanıcı kategorilere göz attığında, Frontend /api/v1/categories adresinden veri çekmelidir
3. Kullanıcı ürün detaylarını görüntülediğinde, Frontend /api/v1/products/{id} adresinden veri çekmelidir
4. Ürünleri görüntülerken, Frontend resimleri, fiyatları, açıklamaları ve puanları göstermelidir
5. Frontend URL sorgu parametreleri aracılığıyla kategori, marka ve fiyat aralığına göre ürün filtrelemeyi desteklemelidir

### Gereksinim 3: Arama ve Keşif

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, aradığımı hızlıca bulabilmek için ürün arayabilmek ve ilgili öneriler almak istiyorum.

#### Kabul Kriterleri

1. Kullanıcı arama kutusuna yazdığında, Frontend /api/v1/search/suggestions adresinden otomatik öneriler sağlamalıdır
2. Kullanıcı arama gönderdiğinde, Frontend /api/v1/search adresinden sonuçları görüntülemelidir
3. Arama sonuçları sayfasındayken, Frontend marka, kategori, fiyat için filtreler sağlamalıdır
4. Sonuç bulunamadığında, Frontend yedek olarak popüler ürünleri görüntülemelidir
5. Frontend arama sonuçları için sunucu taraflı sayfalama uygulamalıdır

### Gereksinim 4: Alışveriş Sepeti Yönetimi

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, ödeme öncesi siparişimi hazırlayabilmek için sepete ürün eklemek ve miktarları yönetmek istiyorum.

#### Kabul Kriterleri

1. Misafir_Kullanıcı ürün eklediğinde, Frontend LocalStorage'dan X-Guest-Id header'ını isteğe enjekte etmelidir
2. Kimlik_Doğrulanmış_Kullanıcı ürün eklediğinde, Frontend X-Guest-Id header'ı göndermemelidir
3. Kullanıcı mevcut misafir sepeti ile giriş yaptığında, Frontend /api/v1/cart/merge aracılığıyla sepet birleştirmeyi tetiklemelidir
4. Sepet güncellendiğinde, Frontend değişiklikleri global UI durumunda anında yansıtmalıdır
5. Frontend hem misafir hem de kimlik doğrulanmış kullanıcılar için sepet durumunu tarayıcı oturumları boyunca korumalıdır

### Gereksinim 5: Kullanıcı Profili ve Sipariş Yönetimi

**Kullanıcı Hikayesi:** Kimlik doğrulanmış bir kullanıcı olarak, hesap bilgilerimi ve satın alma işlemlerimi takip edebilmek için profilimi yönetmek ve sipariş geçmişimi görüntülemek istiyorum.

#### Kabul Kriterleri

1. Kullanıcı profile eriştiğinde, Frontend /api/users/me adresinden verileri görüntülemelidir
2. Kullanıcı profili güncellediğinde, Frontend PUT /api/users/me aracılığıyla değişiklikleri kaydetmelidir
3. Kullanıcı adresleri yönettiğinde, Frontend /api/users/addresses aracılığıyla CRUD işlemleri sağlamalıdır
4. Kullanıcı siparişleri görüntülediğinde, Frontend /api/v1/orders adresinden sipariş geçmişini görüntülemelidir

### Gereksinim 6: Kişiselleştirilmiş Öneriler

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, ilgili ürünleri keşfedebilmek için etkileşim geçmişime dayalı kişiselleştirilmiş ürün önerileri görmek istiyorum.

#### Kabul Kriterleri

1. Ana sayfa yüklendiğinde, Frontend /api/recommendations adresinden önerileri görüntülemelidir
2. Kullanıcı giriş yapmadığında, Frontend misafir özel öneriler almak için X-Guest-Id header'ı göndermelidir
3. Kullanıcı ürün detaylarını görüntülediğinde, Frontend /api/users/history/{productId} aracılığıyla görüntüleme geçmişini kaydetmelidir
4. Öneri servisi başarısız olursa, Frontend yedek olarak Popüler Ürünleri göstermelidir

### Gereksinim 7: Duyarlı Tasarım ve Kullanıcı Deneyimi

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, herhangi bir cihazda rahatça alışveriş yapabilmek için güzel ve duyarlı bir arayüz istiyorum.

#### Kabul Kriterleri

1. Frontend mobil, tablet ve masaüstü cihazlarda tamamen duyarlı olmalıdır
2. Frontend tüm stillendirme için Tailwind CSS ve bileşenler için shadcn/ui kullanmalıdır
3. Frontend tüm API çağrıları için iskelet yükleme durumları uygulamalıdır
4. Frontend Toast bildirimleri aracılığıyla hata işleme sağlamalıdır
5. Frontend erişilebilirlik standartlarını korumalıdır (WCAG 2.1 AA)

### Gereksinim 8: Sipariş İşleme

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, satın alma işlemlerimi tamamlayabilmek için siparişleri güvenli bir şekilde vermek istiyorum.

#### Kabul Kriterleri

1. Kullanıcı ödemeye geçtiğinde, Frontend sepet içeriğini doğrulamalı ve misafirse giriş yapmaya zorlamalıdır
2. Sipariş verirken, Frontend kargo adresi ve ödeme bilgilerini toplamalıdır
3. Sipariş gönderildiğinde, Frontend /api/v1/orders çağrısı yapmalıdır
4. Sipariş başarılı olduğunda, Frontend onay görüntülemeli ve yerel sepet durumunu temizlemelidir

### Gereksinim 9: Performans ve Optimizasyon

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, verimli bir alışveriş deneyimi yaşayabilmek için hızlı sayfa yüklemeleri ve akıcı etkileşimler istiyorum.

#### Kabul Kriterleri

1. Frontend resimler ve rotalar için lazy loading uygulamalıdır
2. Frontend kategoriler ve ürünler için sunucu yanıtlarını önbelleğe almak üzere TanStack Query kullanmalıdır
3. Frontend 90'ın üzerinde Lighthouse performans puanı elde etmelidir

### Gereksinim 10: Hata İşleme ve Dayanıklılık

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, sorunlar oluştuğunda bile uygulamayı kullanmaya devam edebilmek için uygulamanın hataları zarif bir şekilde işlemesini istiyorum.

#### Kabul Kriterleri

1. API çağrıları 4xx/5xx hatalarıyla başarısız olduğunda, Frontend uygun kullanıcı dostu hata mesajları görüntülemelidir
2. Oturum 401 hatası ile sona erdiğinde, Frontend genel sayfada değilse otomatik olarak giriş sayfasına yönlendirmelidir
3. Frontend başarısız GET istekleri için yeniden deneme mantığı uygulamalıdır

## Teknik Mimari ve Uygulama Kılavuzları
Backend-for-Frontend (BFF) mimarisine uygun profesyonel kod kalitesi, performans ve ölçeklenebilirlik sağlamak için aşağıdaki teknik kararlar KESİNLİKLE takip edilmelidir.

### Teknoloji Yığını ("Modern Standart")
Framework: TypeScript ile React 18+ (Vite Build Tool).

Stillendirme ve UI Kütüphanesi:

KULLANILMALI: Tüm düzen ve stillendirme için Tailwind CSS.

KULLANILMALI: Yeniden kullanılabilir bileşenler için shadcn/ui (Butonlar, Girdiler, Diyaloglar, Açılır Menüler, Toast'lar).

Gerekçe: shadcn/ui erişilebilir ilkeller (Radix UI) ve Tailwind aracılığıyla tam stillendirme kontrolü sağlar, Material UI'nin çalışma zamanı performans maliyeti ve stil çakışmalarından kaçınır.

KULLANILMAMALI: Material UI (MUI), Bootstrap veya Styled Components.

Yardımcı: Dinamik sınıf koşullandırması için clsx ve tailwind-merge kullanın.

İkonlar: Lucide React.

Durum Yönetimi:

Zustand: Global istemci tarafı durum için (Sepet öğe sayısı, Kullanıcı Kimlik Doğrulama durumu, UI geçişleri).

TanStack Query (React Query): Sunucu tarafı durum yönetimi için (Ürün çekme, önbelleğe alma, yükleme/hata durumları, mutasyonlar).

Yönlendirme: React Router DOM v6+.

HTTP İstemcisi: Axios.

### Ağ Katmanı ve BFF Entegrasyonu (Kritik)
Merkezi Örnek: src/lib/axios.ts içinde axios.create kullanarak singleton apiClient oluşturun.

Temel URL: http://localhost:8080 (API Gateway).

Kimlik Bilgileri: withCredentials: true ZORUNLUDUR. Bu, HttpOnly Cookie'lerin (SESSION ve XSRF-TOKEN) Gateway'e otomatik olarak gönderilmesini sağlar.

Interceptor Mantığı:

İstek Interceptor'ı:

Global Auth Store'u (Zustand) kontrol edin.

Kullanıcı Kimlik Doğrulanmışsa: Herhangi bir özel header eklemeyin (Gateway Session Cookie'sini kullanır).

Kullanıcı Misafirse (Giriş yapmamış):

LocalStorage'da guest_id kontrol edin.

Eksikse, yeni UUID oluşturun ve kaydedin.

Header enjekte edin: X-Guest-Id: <uuid>.

Yanıt Interceptor'ı:

Global hataları işleyin (örn., 500 Internal Server Error bir Toast gösterir).

401 Unauthorized'ı kesinlikle işleyin: Kullanıcının giriş yapmış olması gerekiyorsa, istemci durumunu temizleyin ve giriş sayfasına yönlendirin.

### Klasör Yapısı (Özellik Tabanlı)
Sürdürülebilirliği sağlamak için kodu iş alanına göre organize edin.

```
src/
├── components/        # Paylaşılan UI bileşenleri (shadcn/ui çıktısı)
│   ├── ui/            # button.tsx, input.tsx, card.tsx (Otomatik oluşturulan)
│   └── shared/        # Özel paylaşılan bileşenler (Navbar, Footer)
├── features/          # İş Mantığı Modülleri
│   ├── auth/          # Giriş mantığı, Kullanıcı Profili bileşeni, Auth hook'ları
│   ├── cart/          # Sepet store (Zustand), AddToCart butonu, CartDrawer
│   ├── catalog/       # Ürün listesi, Filtreler, Arama çubuğu, Ürün Detayları
│   └── checkout/      # Sipariş verme formları ve mantığı
├── hooks/             # Global hook'lar (useGuestId, useDebounce)
├── lib/               # Singleton konfigürasyonları (axios, utils, validators)
├── pages/             # Rota sayfaları (Home, ProductDetail, CartPage, Profile)
├── services/          # API tanımları (Backend Controller'larına uygun)
│   ├── authService.ts
│   ├── cartService.ts
│   └── productService.ts
└── layouts/           # MainLayout, AuthLayout
```

### Kritik Mantık Akışları
#### A. Misafirden Kullanıcıya Birleştirme ("BFF El Sıkışması")
Kullanıcı Keycloak aracılığıyla başarıyla giriş yaptığında ve uygulamaya döndüğünde:

Uygulama Kullanıcı Profilini yükler (/api/users/me).

Kontrol: LocalStorage'da guest_id var mı?

Eylem: Varsa, hemen POST /api/v1/cart/merge?guestId={guest_id} çağrısı yapın.

Temizlik: Başarı durumunda, guest_id'yi LocalStorage'dan kaldırın.

#### B. Resim İşleme Yardımcısı
Backend ürün resimleri mutlak URL'ler (S3) veya göreceli yollar olabilir.

getImageUrl(path: string) yardımcısı oluşturun:

Yol http veya https ile başlıyorsa -> Olduğu gibi döndür.

Değilse -> API Gateway URL'si veya yapılandırılmış CDN temel URL'sini başa ekle.

#### C. Giriş Yönlendirmesi
Giriş istekleri için Axios KULLANMAYIN.

"Giriş" butonu tarayıcı yönlendirmesi yapmalıdır: window.location.href = "http://localhost:8080/oauth2/authorization/keycloak".

## 5. Geliştirme Başlangıç Kontrol Listesi
Bileşen kodu yazmadan önce, temelin sağlam olduğundan emin olun:
1.  [ ] TypeScript ile Vite projesini başlatın.
2.  [ ] Tailwind CSS'i kurun ve shadcn/ui'yi başlatın (`npx shadcn-ui@latest init`).
3.  [ ] `src/lib/axios.ts`'yi `withCredentials: true` ve Interceptor'larla yapılandırın.
4.  [ ] React Router ve temel MainLayout'u (Navbar + Footer) kurun.
5.  [ ] Backend bağlantısını doğrulayın: `/api/v1/products`'ı çekin ve sonuçları konsola yazdırın.