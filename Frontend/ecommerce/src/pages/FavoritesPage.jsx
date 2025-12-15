import { useState } from 'react';
import { Container, Typography, Box, Grid, Button } from '@mui/material';
import { Favorite, ShoppingBag } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const FavoritesPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [favorites] = useState([]); // Backend'den gelecek

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Favorite sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Favorilerinizi Görmek İçin Giriş Yapın
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca ulaşabilirsiniz.
        </Typography>
        <Button variant="contained" size="large" onClick={login} sx={{ mt: 2 }}>
          Giriş Yap
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        Favorilerim
      </Typography>

      {favorites.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Favorite sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Henüz favori ürününüz yok
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca ulaşabilirsiniz.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ShoppingBag />}
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Alışverişe Başla
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {favorites.map((product) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default FavoritesPage;
