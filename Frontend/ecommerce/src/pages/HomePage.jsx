import { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Button, IconButton, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { mockProducts, dailyDeals, mockCategories } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { ArrowForward, ChevronLeft, ChevronRight } from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Ana kategoriler (parent'ı null olanlar)
  const mainCategories = mockCategories.filter(cat => !cat.parent);

  // Hero slider için kampanyalar
  const heroSlides = [
    {
      id: 1,
      title: 'Seçili Bilgisayar Parçalarında Müthiş Cuma\'yı Keşfedin!',
      subtitle: 'Kampanya 27 - 31 Aralık tarihleri arasında geçerlidir',
      image: 'https://via.placeholder.com/1200x350/1a1a2e/00d4ff?text=Gaming+Campaign',
      cta: 'Tüm Ürünler',
      link: '/products?category=notebook'
    },
    {
      id: 2,
      title: 'iPhone 15 Serisi Geldi',
      subtitle: 'Titanyum Tasarım, A17 Pro Çip ile Tanışın',
      image: 'https://via.placeholder.com/1200x350/1a1a2e/00ff88?text=iPhone+15',
      cta: 'Keşfet',
      link: '/products?category=cep-telefonu'
    },
    {
      id: 3,
      title: 'Ekran Kartlarında Büyük Fırsat',
      subtitle: 'RTX 4090 ve RTX 4080 Modelleri Stoklarda',
      image: 'https://via.placeholder.com/1200x350/1a1a2e/ff6b00?text=GPU+Sale',
      cta: 'Fırsatları Gör',
      link: '/products?category=ekran-karti'
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Slider - Kompakt */}
      <Box sx={{ mb: 3 }}>
        <Paper 
          elevation={0}
          sx={{ 
            position: 'relative', 
            height: { xs: 200, sm: 250, md: 300 }, 
            overflow: 'hidden', 
            borderRadius: 0,
            border: 'none',
          }}
        >
          {heroSlides.map((slide, index) => (
            <Box
              key={slide.id}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: currentSlide === index ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
                background: `linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
                  <Typography 
                    variant="h4" 
                    fontWeight={600}
                    gutterBottom 
                    sx={{ 
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    {slide.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ 
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                      opacity: 0.9,
                      mb: 2,
                    }}
                  >
                    {slide.subtitle}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate(slide.link)}
                    sx={{ 
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 3,
                      py: 1,
                      fontSize: '0.9rem',
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                      },
                    }}
                  >
                    {slide.cta}
                  </Button>
                </Box>
              </Container>
            </Box>
          ))}
          
          {/* Slider Controls */}
          <IconButton
            onClick={prevSlide}
            size="small"
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.9)',
              color: 'primary.main',
              width: 36,
              height: 36,
              '&:hover': { bgcolor: 'white' },
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={nextSlide}
            size="small"
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.9)',
              color: 'primary.main',
              width: 36,
              height: 36,
              '&:hover': { bgcolor: 'white' },
            }}
          >
            <ChevronRight />
          </IconButton>

          {/* Dots */}
          <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
            {heroSlides.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentSlide(index)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </Box>
        </Paper>
      </Box>

      <Container maxWidth="lg">


        {/* Öne Çıkan Ürünler */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Öne Çıkan Ürünler
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              En popüler teknoloji ürünleri
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {mockProducts.slice(0, 4).map((product) => (
              <Grid item xs={6} sm={6} md={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Kompakt Banner */}
        <Box sx={{ mb: 4 }}>
          <Paper 
            elevation={0}
            sx={{ 
              position: 'relative',
              height: 80,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/product/iphone-15-pro-max')}
          >
            <Box sx={{ 
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              px: 3,
              color: 'white',
            }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
                  Haftanın Favorisi
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                  13. Nesil Core i7 İşlemcili Lenovo Ideapad Slim 3 - 33.499 TL
                </Typography>
              </Box>
              <Box sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: 1,
                px: 2,
                py: 0.5,
                border: '1px solid rgba(255,255,255,0.3)',
              }}>
                <Typography variant="caption" fontWeight={600}>
                  İncele
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Çok Satanlar */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Çok Satanlar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Müşteri favorisi ürünler
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {dailyDeals.map((product) => (
              <Grid item xs={6} sm={6} md={4} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Kategoriler - Kompakt */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom sx={{ mb: 1.5, color: 'text.secondary', fontSize: '0.9rem' }}>
            Kategoriler
          </Typography>
          <Grid container spacing={1}>
            {[
              { name: 'Telefon', icon: '📱' },
              { name: 'Notebook', icon: '💻' },
              { name: 'Televizyon', icon: '📺' },
              { name: 'Süpürge', icon: '🧹' },
              { name: 'Yazıcı', icon: '🖨️' },
              { name: 'Kahve Makinesi', icon: '☕' },
              { name: 'Ev Ürünleri', icon: '🏠' },
              { name: 'Kişisel Bakım', icon: '💄' },
              { name: 'Aksesuar', icon: '🎧' },
            ].map((category, index) => (
              <Grid item xs={4} sm={3} md={1.33} key={index}>
                <Box
                  onClick={() => navigate(`/products?category=${category.name.toLowerCase()}`)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                    },
                  }}
                >
                  <Box sx={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 1, 
                    bgcolor: '#f8f9fa',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mb: 0.5,
                    border: '1px solid #e0e0e0',
                  }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>
                      {category.icon}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', textAlign: 'center' }}>
                    {category.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Çok Satan Markalar - Kompakt */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" gutterBottom sx={{ mb: 1.5, color: 'text.secondary', fontSize: '0.9rem' }}>
            Çok Satan Markalar
          </Typography>
          <Grid container spacing={1} alignItems="center">
            {[
              { name: 'Apple', logo: 'https://via.placeholder.com/60x30/ffffff/000000?text=Apple' },
              { name: 'Samsung', logo: 'https://via.placeholder.com/60x30/ffffff/1976d2?text=SAMSUNG' },
              { name: 'Dyson', logo: 'https://via.placeholder.com/60x30/ffffff/7b1fa2?text=dyson' },
              { name: 'Philips', logo: 'https://via.placeholder.com/60x30/ffffff/2196f3?text=PHILIPS' },
              { name: 'Microsoft', logo: 'https://via.placeholder.com/60x30/ffffff/4caf50?text=Microsoft' },
              { name: 'ASUS', logo: 'https://via.placeholder.com/60x30/ffffff/ff9800?text=ASUS' },
              { name: 'Lenovo', logo: 'https://via.placeholder.com/60x30/ffffff/f44336?text=lenovo' },
              { name: 'Xiaomi', logo: 'https://via.placeholder.com/60x30/ffffff/ff5722?text=Mi' },
              { name: 'LG', logo: 'https://via.placeholder.com/60x30/ffffff/e91e63?text=LG' },
              { name: 'MSI', logo: 'https://via.placeholder.com/60x30/ffffff/9c27b0?text=MSI' },
            ].map((brand, index) => (
              <Grid item xs={6} sm={4} md={2.4} lg={1.2} key={index}>
                <Box
                  onClick={() => navigate(`/products?brand=${brand.name.toLowerCase()}`)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    border: '1px solid #e0e0e0',
                    bgcolor: 'white',
                    height: 40,
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <img 
                    src={brand.logo} 
                    alt={brand.name}
                    style={{ 
                      maxWidth: '60px', 
                      maxHeight: '20px',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Hizmetlerimiz - Türkçe ve Kompakt */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Hizmetlerimiz
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Güvenli ve hızlı alışveriş deneyimi
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: '#e8f5e8',
                textAlign: 'center',
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 1, 
                  bgcolor: '#4caf50', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                }}>
                  <Typography sx={{ fontSize: '1.2rem', color: 'white' }}>✓</Typography>
                </Box>
                <Typography variant="body1" fontWeight={600} gutterBottom sx={{ fontSize: '0.9rem' }}>
                  Ücretsiz Kargo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  500 TL üzeri siparişlerde
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: '#fff3e0',
                textAlign: 'center',
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 1, 
                  bgcolor: '#ff9800', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                }}>
                  <Typography sx={{ fontSize: '1.2rem', color: 'white' }}>↩</Typography>
                </Box>
                <Typography variant="body1" fontWeight={600} gutterBottom sx={{ fontSize: '0.9rem' }}>
                  Kolay İade
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  14 gün içinde iade hakkı
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: '#f3e5f5',
                textAlign: 'center',
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 1, 
                  bgcolor: '#9c27b0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                }}>
                  <Typography sx={{ fontSize: '1.2rem', color: 'white' }}>🎧</Typography>
                </Box>
                <Typography variant="body1" fontWeight={600} gutterBottom sx={{ fontSize: '0.9rem' }}>
                  7/24 Destek
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Müşteri hizmetleri
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
