# TechShop - Modern E-Ticaret Frontend

Teknoloji ürünleri satan, dark mode ağırlıklı, güvenli bir e-ticaret platformu.

## 🚀 Özellikler

### Güvenlik
- **Zero Trust Mimari**: JWT token'lar frontend'de saklanmaz
- **OAuth2 Login**: Keycloak ile güvenli kimlik doğrulama
- **CSRF Koruması**: Tüm veri değiştiren isteklerde CSRF token kontrolü
- **Gateway Pattern**: Tüm API istekleri API Gateway üzerinden

### Kullanıcı Deneyimi
- **Dark Mode**: Teknoloji hissini veren koyu tema
- **Responsive**: Mobil, tablet ve masaüstü uyumlu
- **Misafir Erişim**: Giriş yapmadan ürün görüntüleme
- **Akıllı Yönlendirme**: Sepet/ödeme için otomatik login yönlendirmesi

### Teknik Stack
- React 19
- Material UI (MUI)
- Tailwind CSS
- React Router
- Axios
- js-cookie

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
```

## 🔧 Yapılandırma

### API Gateway URL
`src/utils/api.js` dosyasında Gateway URL'ini değiştirin:

```javascript
const GATEWAY_URL = 'http://localhost:8080';
```

## 🏗️ Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── ProductCard.jsx
├── pages/              # Sayfa bileşenleri
│   ├── HomePage.jsx
│   ├── ProductListPage.jsx
│   ├── ProductDetailPage.jsx
│   └── CartPage.jsx
├── context/            # React Context'ler
│   └── AuthContext.jsx
├── utils/              # Yardımcı fonksiyonlar
│   └── api.js         # API çağrıları ve CSRF yönetimi
├── data/               # Mock veriler
│   └── mockData.js
├── theme/              # MUI tema yapılandırması
│   └── theme.js
└── App.jsx
```

## 🔐 Güvenlik Akışı

### Login
1. Kullanıcı "Giriş Yap" butonuna tıklar
2. `window.location.href = "http://localhost:8080/oauth2/authorization/keycloak"`
3. Keycloak login sayfasına yönlendirilir
4. Başarılı girişten sonra Gateway session cookie bırakır

### Logout
1. CSRF token cookie'den okunur
2. Form submit ile POST /logout
3. Gateway session'ı sonlandırır ve Keycloak'tan da çıkış yapar

### API İstekleri
- GET istekleri: Herkes erişebilir (public)
- POST/PUT/DELETE: CSRF token header'a eklenir
- 401 hatası: Login'e yönlendir
- 403 hatası: Yetkisiz erişim uyarısı

## 📱 Sayfalar

### Ana Sayfa (/)
- Hero slider
- Kategori grid
- Günün fırsatları
- Popüler ürünler

### Ürün Listesi (/products)
- Filtreleme (fiyat, kategori, marka)
- Arama
- Responsive grid

### Ürün Detay (/product/:slug)
- Büyük ürün görseli
- Teknik özellikler tablosu
- Sepete ekleme (auth gerekli)
- Favori ekleme
- Yorumlar

### Sepet (/cart)
- Sepet ürünleri
- Miktar güncelleme
- Sipariş özeti
- Ödemeye geçiş (auth gerekli)

## 🎨 Tema Renkleri

- **Primary (Cyber Blue)**: #00d4ff
- **Secondary (Cyber Green)**: #00ff88
- **Background**: #0a0e27
- **Card Background**: #151932

## 🔄 Backend Entegrasyonu

Proje şu an mock veri ile çalışıyor. Backend hazır olduğunda:

1. `src/data/mockData.js` yerine gerçek API çağrıları kullanın
2. `src/utils/api.js` içindeki endpoint'ler zaten hazır
3. Sadece mock import'ları kaldırın

## 📝 Notlar

- JWT token'lar asla localStorage'da saklanmaz
- Session cookie'ler httpOnly olmalı
- CSRF token her istekte otomatik eklenir
- Misafir kullanıcılar ürünleri görebilir ama sepete ekleyemez
