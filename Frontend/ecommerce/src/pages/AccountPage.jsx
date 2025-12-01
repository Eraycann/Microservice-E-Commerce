import { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person,
  ShoppingBag,
  Favorite,
  LocationOn,
  CreditCard,
  Reviews,
  HelpOutline,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Person sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Hesap Bilgilerinizi Görmek İçin Giriş Yapın
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Siparişlerinizi takip edin, favorilerinizi yönetin ve daha fazlası.
        </Typography>
        <Button variant="contained" size="large" onClick={login} sx={{ mt: 2 }}>
          Giriş Yap
        </Button>
      </Container>
    );
  }

  const tabContent = [
    {
      label: 'Hesap Bilgileri',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Kişisel Bilgiler
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Ad" defaultValue="Kullanıcı" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Soyad" defaultValue="Test" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="E-posta" defaultValue="user@test.com" disabled />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Telefon" defaultValue="+90 555 123 4567" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Doğum Tarihi" type="date" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" size="large">
                Bilgileri Güncelle
              </Button>
            </Grid>
          </Grid>
        </Box>
      ),
    },
    {
      label: 'Adreslerim',
      content: (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Kayıtlı Adresler
            </Typography>
            <Button variant="outlined">+ Yeni Adres Ekle</Button>
          </Box>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <LocationOn sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Henüz kayıtlı adresiniz bulunmamaktadır.
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Siparişlerim',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Sipariş Geçmişi
          </Typography>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingBag sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Henüz siparişiniz bulunmamaktadır.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
              Alışverişe Başla
            </Button>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Favorilerim',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Favori Ürünler
          </Typography>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Favorite sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Henüz favori ürününüz yok.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
              Ürünleri İncele
            </Button>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Yorumlarım',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Ürün Yorumları ve Sorular
          </Typography>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Reviews sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Henüz yorum veya soru yazmamışsınız.
            </Typography>
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={600} sx={{ mb: 4 }}>
        Hesabım
      </Typography>

      <Grid container spacing={4}>
        {/* Sol Menü */}
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
            <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" fontWeight={600}>
                Merhaba!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'user@test.com'}
              </Typography>
            </Box>
            <Tabs
              orientation="vertical"
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              {tabContent.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  sx={{ 
                    alignItems: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    minHeight: 48,
                  }}
                />
              ))}
            </Tabs>
          </Paper>
        </Grid>

        {/* Sağ İçerik */}
        <Grid item xs={12} md={9}>
          <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0' }}>
            {tabContent[selectedTab]?.content}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AccountPage;