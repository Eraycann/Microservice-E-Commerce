import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TextField,
  Rating,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Add,
  Remove,
} from '@mui/icons-material';
import { mockProducts } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const foundProduct = mockProducts.find(p => p.slug === slug);
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      navigate('/404');
    }
  }, [slug, navigate]);

  if (!product) return null;

  const specs = product.specsData ? JSON.parse(product.specsData) : {};

  const handleAddToCart = () => {
    if (!user) {
      login();
      return;
    }
    // Sepete ekleme işlemi
    alert(`${quantity} adet ${product.name} sepete eklendi!`);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stockCount) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Sol - Ürün Görseli */}
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src={product.images?.[0]?.imageUrl || 'https://via.placeholder.com/600x400'}
            alt={product.name}
            sx={{
              width: '100%',
              borderRadius: 2,
              bgcolor: 'background.paper',
              p: 2,
            }}
          />
        </Grid>

        {/* Sağ - Ürün Bilgileri */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              {product.brandName}
            </Typography>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={4.5} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary">
                (128 değerlendirme)
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h3" color="primary.main" fontWeight="bold" gutterBottom>
              ₺{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </Typography>

            <Typography
              variant="body1"
              color={product.stockCount > 0 ? 'success.main' : 'error.main'}
              gutterBottom
            >
              {product.stockCount > 0 ? `Stokta ${product.stockCount} adet` : 'Stokta Yok'}
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph sx={{ mt: 2 }}>
              {product.description}
            </Typography>

            {/* Hızlı Özellikler */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 3 }}>
              {Object.entries(specs).slice(0, 3).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  sx={{
                    bgcolor: 'rgba(0, 212, 255, 0.1)',
                    color: 'primary.main',
                  }}
                />
              ))}
            </Box>

            {/* Miktar Seçici */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
              <Typography variant="body1">Miktar:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  <Remove />
                </IconButton>
                <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stockCount}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  <Add />
                </IconButton>
              </Box>
            </Box>

            {/* Butonlar */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stockCount === 0}
                sx={{ flex: 1 }}
              >
                Sepete Ekle
              </Button>
              <IconButton
                onClick={() => {
                  if (!user) {
                    login();
                    return;
                  }
                  setIsFavorite(!isFavorite);
                  // Backend'e favori ekleme/çıkarma isteği
                }}
                sx={{
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'rgba(0, 212, 255, 0.1)' },
                }}
                title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              >
                {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
              </IconButton>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Detaylı Bilgiler - Tabs */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Teknik Özellikler" />
          <Tab label="Açıklama" />
          <Tab label="Yorumlar" />
          <Tab label="Soru & Cevap" />
        </Tabs>

        <Box sx={{ mt: 3, bgcolor: 'background.paper', p: 3, borderRadius: 2 }}>
          {tabValue === 0 && (
            <Table>
              <TableBody>
                {Object.entries(specs).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>{key}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tabValue === 1 && (
            <Typography variant="body1" color="text.secondary">
              {product.description}
            </Typography>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Müşteri Yorumları
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Rating value={4.5} precision={0.5} readOnly size="large" />
                  <Typography variant="h5" fontWeight="bold">4.5</Typography>
                  <Typography variant="body2" color="text.secondary">(128 değerlendirme)</Typography>
                </Box>
              </Box>
              
              {user && (
                <Box sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Ürünü Değerlendir</Typography>
                  <Rating size="large" sx={{ mb: 2 }} />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Yorumunuzu yazın..."
                    variant="outlined"
                    size="small"
                  />
                  <Button variant="contained" size="small" sx={{ mt: 2 }}>
                    Yorum Yap
                  </Button>
                </Box>
              )}

              <Typography variant="body2" color="text.secondary">
                Henüz yorum yapılmamış. İlk yorumu siz yapın!
              </Typography>
            </Box>
          )}

          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Soru & Cevap
              </Typography>
              
              {user && (
                <Box sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Ürün Hakkında Soru Sor</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Sorunuzu yazın..."
                    variant="outlined"
                    size="small"
                  />
                  <Button variant="contained" size="small" sx={{ mt: 2 }}>
                    Soru Sor
                  </Button>
                </Box>
              )}

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Henüz soru sorulmamış. İlk soruyu siz sorun!
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ProductDetailPage;
