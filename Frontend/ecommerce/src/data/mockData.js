// Mock kategoriler - Backend'den gelene kadar
export const mockCategories = [
  { id: 1, name: 'Bilgisayar', slug: 'bilgisayar', parent: null },
  { id: 2, name: 'Notebook', slug: 'notebook', parent: { id: 1 } },
  { id: 3, name: 'Tablet', slug: 'tablet', parent: { id: 1 } },
  { id: 4, name: 'Masaüstü', slug: 'masaustu', parent: { id: 1 } },
  { id: 5, name: 'Telefon', slug: 'telefon', parent: null },
  { id: 6, name: 'Cep Telefonu', slug: 'cep-telefonu', parent: { id: 5 } },
  { id: 7, name: 'Yenilenmiş Telefon', slug: 'yenilenmis-telefon', parent: { id: 5 } },
  { id: 8, name: 'Bileşenler', slug: 'bilesenler', parent: null },
  { id: 9, name: 'Ram', slug: 'ram', parent: { id: 8 } },
  { id: 10, name: 'Anakart', slug: 'anakart', parent: { id: 8 } },
  { id: 11, name: 'İşlemci', slug: 'islemci', parent: { id: 8 } },
  { id: 12, name: 'Ekran Kartı', slug: 'ekran-karti', parent: { id: 8 } },
  { id: 13, name: 'SSD', slug: 'ssd', parent: { id: 8 } },
  { id: 14, name: 'Kasa', slug: 'kasa', parent: { id: 8 } },
  { id: 15, name: 'Çevre Birimleri', slug: 'cevre-birimleri', parent: null },
  { id: 16, name: 'Monitör', slug: 'monitor', parent: { id: 15 } },
  { id: 17, name: 'Klavye', slug: 'klavye', parent: { id: 15 } },
  { id: 18, name: 'Mouse', slug: 'mouse', parent: { id: 15 } },
  { id: 19, name: 'Kulaklık', slug: 'kulaklik', parent: { id: 15 } },
  { id: 20, name: 'Eğlence', slug: 'eglence', parent: null },
  { id: 21, name: 'PlayStation 5', slug: 'playstation-5', parent: { id: 20 } },
  { id: 22, name: 'Televizyon', slug: 'televizyon', parent: { id: 20 } },
  { id: 23, name: 'Akıllı Saat', slug: 'akilli-saat', parent: { id: 20 } },
];

// Mock ürünler
export const mockProducts = [
  {
    id: 1,
    slug: 'asus-rog-strix-g15',
    name: 'ASUS ROG Strix G15 Gaming Laptop',
    description: 'AMD Ryzen 9 5900HX işlemci, NVIDIA RTX 3070 ekran kartı ile üstün performans',
    price: 45999.99,
    categoryName: 'Notebook',
    brandName: 'ASUS',
    stockCount: 15,
    specsData: JSON.stringify({
      'İşlemci': 'AMD Ryzen 9 5900HX',
      'RAM': '16GB DDR4',
      'Ekran Kartı': 'NVIDIA RTX 3070 8GB',
      'Depolama': '1TB NVMe SSD',
      'Ekran': '15.6" FHD 300Hz',
      'İşletim Sistemi': 'Windows 11'
    }),
    images: [
      { id: 1, imageUrl: 'https://via.placeholder.com/600x400/1a1a2e/00d4ff?text=ASUS+ROG', displayOrder: 1 }
    ]
  },
  {
    id: 2,
    slug: 'iphone-15-pro-max',
    name: 'Apple iPhone 15 Pro Max',
    description: 'A17 Pro çip, Titanyum tasarım, ProMotion ekran',
    price: 74999.99,
    categoryName: 'Cep Telefonu',
    brandName: 'Apple',
    stockCount: 8,
    specsData: JSON.stringify({
      'İşlemci': 'Apple A17 Pro',
      'RAM': '8GB',
      'Depolama': '256GB',
      'Ekran': '6.7" Super Retina XDR',
      'Kamera': '48MP Ana + 12MP Ultra Wide',
      'Batarya': '4422 mAh'
    }),
    images: [
      { id: 2, imageUrl: 'https://via.placeholder.com/600x400/1a1a2e/00ff88?text=iPhone+15+Pro', displayOrder: 1 }
    ]
  },
  {
    id: 3,
    slug: 'corsair-vengeance-rgb-32gb',
    name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR4',
    description: 'Yüksek performanslı RGB aydınlatmalı gaming RAM',
    price: 3499.99,
    categoryName: 'Ram',
    brandName: 'Corsair',
    stockCount: 42,
    specsData: JSON.stringify({
      'Kapasite': '32GB (2x16GB)',
      'Tip': 'DDR4',
      'Frekans': '3600MHz',
      'CAS Latency': 'CL18',
      'Voltaj': '1.35V',
      'RGB': 'Evet'
    }),
    images: [
      { id: 3, imageUrl: 'https://via.placeholder.com/600x400/1a1a2e/ff00ff?text=Corsair+RAM', displayOrder: 1 }
    ]
  },
  {
    id: 4,
    slug: 'samsung-odyssey-g7-27',
    name: 'Samsung Odyssey G7 27" Gaming Monitör',
    description: '240Hz, 1ms, QLED, Curved gaming monitör',
    price: 12999.99,
    categoryName: 'Monitör',
    brandName: 'Samsung',
    stockCount: 12,
    specsData: JSON.stringify({
      'Boyut': '27 inç',
      'Çözünürlük': '2560x1440 (QHD)',
      'Yenileme Hızı': '240Hz',
      'Tepki Süresi': '1ms',
      'Panel': 'QLED VA',
      'Eğrilik': '1000R'
    }),
    images: [
      { id: 4, imageUrl: 'https://via.placeholder.com/600x400/1a1a2e/00d4ff?text=Samsung+Monitor', displayOrder: 1 }
    ]
  },
  {
    id: 5,
    slug: 'rtx-4090-gaming-oc',
    name: 'NVIDIA GeForce RTX 4090 Gaming OC 24GB',
    description: 'En üst seviye oyun ve yapay zeka performansı',
    price: 89999.99,
    categoryName: 'Ekran Kartı',
    brandName: 'NVIDIA',
    stockCount: 3,
    specsData: JSON.stringify({
      'GPU': 'NVIDIA GeForce RTX 4090',
      'VRAM': '24GB GDDR6X',
      'Boost Clock': '2520 MHz',
      'CUDA Cores': '16384',
      'TDP': '450W',
      'Çıkışlar': '3x DisplayPort 1.4a, 1x HDMI 2.1'
    }),
    images: [
      { id: 5, imageUrl: 'https://via.placeholder.com/600x400/1a1a2e/ff6b00?text=RTX+4090', displayOrder: 1 }
    ]
  },
  {
    id: 6,
    slug: 'playstation-5-slim',
    name: 'Sony PlayStation 5 Slim Digital Edition',
    description: 'Yeni nesil oyun konsolu, 1TB SSD',
    price: 18999.99,
    categoryName: 'PlayStation 5',
    brandName: 'Sony',
    stockCount: 25,
    specsData: JSON.stringify({
      'İşlemci': 'AMD Zen 2, 8 Cores',
      'GPU': 'AMD RDNA 2, 10.28 TFLOPs',
      'RAM': '16GB GDDR6',
      'Depolama': '1TB SSD',
      'Çözünürlük': '4K 120Hz',
      'Ray Tracing': 'Evet'
    }),
    images: [
      { id: 6, imageUrl: 'https://via.placeholder.com/600x400/1a1a2e/0066ff?text=PS5+Slim', displayOrder: 1 }
    ]
  },
];

// Hero slider için öne çıkan ürünler
export const featuredProducts = mockProducts.slice(0, 3);

// Günün fırsatları
export const dailyDeals = mockProducts.filter(p => [1, 3, 6].includes(p.id));
