# Geliştirme Notları

## 🔄 Backend Entegrasyonu

### Adım 1: Mock Veri'den Gerçek API'ye Geçiş

1. **api.js dosyasını kontrol edin**
   - Tüm endpoint'ler zaten tanımlı
   - CSRF token yönetimi hazır
   - Interceptor'lar yapılandırılmış

2. **Component'lerde değişiklik yapın**
   ```javascript
   // Eski (Mock):
   import { mockProducts } from '../data/mockData';
   const [products] = useState(mockProducts);

   // Yeni (API):
   import { productAPI } from '../utils/api';
   const [products, setProducts] = useState([]);
   
   useEffect(() => {
     productAPI.getAll()
       .then(res => setProducts(res.data))
       .catch(err => console.error(err));
   }, []);
   ```

3. **useProducts hook'unu kullanın**
   ```javascript
   import { useProducts } from '../hooks/useProducts';
   
   const { products, loading, error } = useProducts();
   ```

### Adım 2: Auth Kontrolü

Backend hazır olduğunda `AuthContext.jsx` içindeki `checkAuth` fonksiyonu otomatik çalışacak:

```javascript
const checkAuthStatus = async () => {
  try {
    const userData = await authAPI.checkAuth(); // GET /api/v1/users/me
    setUser(userData);
  } catch (error) {
    setUser(null);
  }
};
```

### Adım 3: CSRF Token Test

1. Backend'de CSRF filter'ın aktif olduğundan emin olun
2. Browser console'da kontrol edin:
   ```javascript
   document.cookie // XSRF-TOKEN görünmeli
   ```
3. POST isteği atın ve Network tab'da header'ı kontrol edin:
   ```
   X-XSRF-TOKEN: <token-value>
   ```

## 🧪 Test Senaryoları

### Misafir Kullanıcı
1. Ana sayfayı ziyaret et ✓
2. Ürünleri görüntüle ✓
3. Ürün detayına git ✓
4. "Sepete Ekle" butonuna tıkla → Login'e yönlendir ✓

### Giriş Yapmış Kullanıcı
1. "Giriş Yap" butonuna tıkla
2. Keycloak'a yönlendir
3. Giriş yap
4. Ana sayfaya dön
5. Sepete ürün ekle ✓
6. Sepeti görüntüle ✓
7. Çıkış yap ✓

### CSRF Koruması
1. POST /api/v1/cart/items (CSRF token ile) → 200 OK
2. POST /api/v1/cart/items (CSRF token olmadan) → 403 Forbidden

## 🎨 Tema Özelleştirme

`src/theme/theme.js` dosyasında renkleri değiştirebilirsiniz:

```javascript
primary: {
  main: '#00d4ff', // Cyber Blue
  light: '#4de4ff',
  dark: '#00a8cc',
},
secondary: {
  main: '#00ff88', // Cyber Green
  light: '#4dffaa',
  dark: '#00cc6d',
},
```

## 📱 Responsive Breakpoints

MUI breakpoint'leri:
- xs: 0px
- sm: 600px
- md: 900px
- lg: 1200px
- xl: 1536px

## 🔧 Önerilen Geliştirmeler

### Öncelik 1 (Temel)
- [ ] Gerçek backend API entegrasyonu
- [ ] Sepet state yönetimi (Context veya Redux)
- [ ] Ödeme sayfası
- [ ] Sipariş geçmişi sayfası

### Öncelik 2 (Özellikler)
- [ ] Ürün arama (backend'de Elasticsearch)
- [ ] Favori ürünler
- [ ] Ürün karşılaştırma
- [ ] Filtre kaydetme
- [ ] Bildirimler (WebSocket)

### Öncelik 3 (İyileştirmeler)
- [ ] Image lazy loading
- [ ] Infinite scroll
- [ ] PWA desteği
- [ ] SEO optimizasyonu
- [ ] Analytics entegrasyonu

## 🐛 Bilinen Sorunlar

1. **Mock veri kullanımı**: Gerçek backend bağlantısı yok
2. **Sepet state**: Sayfa yenilendiğinde sepet sıfırlanıyor (backend'e bağlanınca düzelecek)
3. **Auth state**: Session kontrolü mock

## 📚 Faydalı Komutlar

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Build önizleme
npm run preview

# Lint kontrolü
npm run lint

# Bağımlılık güncellemesi
npm update

# Cache temizleme
npm cache clean --force
```

## 🔗 Backend Endpoint'leri

### Public (Giriş gerektirmez)
- GET /api/v1/products
- GET /api/v1/products/{id}
- GET /api/v1/products/slug/{slug}
- GET /api/v1/categories

### Protected (Giriş gerektirir)
- GET /api/v1/cart
- POST /api/v1/cart/items
- DELETE /api/v1/cart/items/{productId}
- GET /api/v1/users/me
- POST /api/reviews

### Admin Only
- POST /api/v1/products
- PUT /api/v1/products/{id}
- DELETE /api/v1/products/{id}
