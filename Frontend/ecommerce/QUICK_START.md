# 🚀 Hızlı Başlangıç

## Projeyi Çalıştırma

```bash
cd Frontend/ecommerce
npm install
npm run dev
```

Tarayıcıda açın: **http://localhost:5174**

## 🎯 Test Senaryoları

### 1. Misafir Kullanıcı Olarak
1. Ana sayfayı görüntüle
2. Kategorilere tıkla
3. Ürün listesini gör
4. Filtreleri kullan (fiyat, kategori, marka)
5. Ürün detayına git
6. "Sepete Ekle" butonuna tıkla → Login'e yönlendirileceksin

### 2. Giriş Yaparak (Backend hazır olduğunda)
1. "Giriş Yap" butonuna tıkla
2. Keycloak'a yönlendirileceksin
3. Giriş yap
4. Ana sayfaya dön
5. Sepete ürün ekle
6. Sepeti görüntüle
7. Çıkış yap

## 📱 Sayfalar

- **/** - Ana sayfa
- **/categories** - Kategori listesi
- **/products** - Ürün listesi
- **/products?category=notebook** - Kategori filtreli
- **/products?search=asus** - Arama sonuçları
- **/product/asus-rog-strix-g15** - Ürün detay
- **/cart** - Sepet (giriş gerekli)

## 🎨 Özellikler

✅ Dark mode tema  
✅ Responsive tasarım  
✅ Ürün filtreleme  
✅ Arama  
✅ Sepet yönetimi  
✅ CSRF koruması  
✅ OAuth2 login hazır  

## 🔧 Backend Bağlantısı

Backend hazır olduğunda:

1. Backend'i başlat (port 8080)
2. Keycloak'ı yapılandır
3. Frontend otomatik bağlanacak

API endpoint'leri `src/utils/api.js` dosyasında tanımlı.

## 📚 Daha Fazla Bilgi

- **README.md** - Detaylı kullanım kılavuzu
- **DEVELOPMENT.md** - Geliştirme notları
- **PROJECT_SUMMARY.md** - Proje özeti

## 🐛 Sorun mu var?

1. `node_modules` klasörünü sil
2. `npm install` yap
3. `npm run dev` ile başlat

Hala sorun varsa:
```bash
npm cache clean --force
npm install
```

## 🎉 Başarılar!

Proje hazır! Keyifli kodlamalar 🚀
