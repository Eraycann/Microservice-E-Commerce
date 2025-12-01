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
} from '@mui/material';
import {
  Person,
  ShoppingBag,
  Favorite,
  Notifications,
  Security,
  LocationOn,
  CreditCard,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('profile');

  if (!user) {
    login();
    return null;
  }

  const menuItems = [
    { id: 'profile', label: 'Hesap Bilgilerim', icon: <Person /> },
    { id: 'orders', label: 'Siparişlerim', icon: <ShoppingBag /> },
    { id: 'favorites', label: 'Favorilerim', icon: <Favorite /> },
    { id: 'addresses', label: 'Adreslerim', icon: <LocationOn /> },
    { id: 'cards', label: 'Kartlarım', icon: <CreditCard /> },
    { id: 'notifications', label: 'Bildirimler', icon: <Notifications /> },
    { id: 'security', label: 'Güvenlik', icon: <Security /> },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'profile':
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Hesap Bilgilerim
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Ad" defaultValue="Kullanıcı" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Soyad" defaultValue="Test" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="E-posta" defaultValue="user@test.com" disabled />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Telefon" defaultValue="+90 555 123 4567" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Doğum Tarihi" type="date" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained">Bilgileri Güncelle</Button>
              </Grid>
            </Grid>
          </Box>
        );

      case 'orders':
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Siparişlerim
            </Typography>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ShoppingBag sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Henüz siparişiniz bulunmamaktadır.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
                Alışverişe Başla
              </Button>
            </Box>
          </Box>
        );

      case 'favorites':
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Favorilerim
            </Typography>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Favorite sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Henüz favori ürününüz yok.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
                Ürünleri İncele
              </Button>
            </Box>
          </Box>
        );

      case 'addresses':
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Adreslerim
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              + Yeni Adres Ekle
            </Button>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <LocationOn sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Kayıtlı adresiniz bulunmamaktadır.
              </Typography>
            </Box>
          </Box>
        );

      case 'cards':
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Kayıtlı Kartlarım
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              + Yeni Kart Ekle
            </Button>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CreditCard sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Kayıtlı kartınız bulunmamaktadır.
              </Typography>
            </Box>
          </Box>
        );

      case 'notifications':
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Bildirim Ayarları
            </Typography>
            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="E-posta bildirimleri"
              />
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="SMS bildirimleri"
              />
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={<Switch />}
                label="Kampanya bildirimleri"
              />
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Sipariş durumu bildirimleri"
              />
            </Box>
          </Box>
        );

      case 'security':
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Güvenlik Ayarları
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Şifre Değiştir
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField fullWidth type="password" label="Mevcut Şifre" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth type="password" label="Yeni Şifre" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth type="password" label="Yeni Şifre (Tekrar)" />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained">Şifreyi Güncelle</Button>
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" gutterBottom>
                İki Faktörlü Doğrulama
              </Typography>
              <FormControlLabel
                control={<Switch />}
                label="İki faktörlü doğrulamayı etkinleştir"
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Sol Menü */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight="bold">
                Hesabım
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'user@test.com'}
              </Typography>
            </Box>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    selected={selectedTab === item.id}
                    onClick={() => setSelectedTab(item.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Sağ İçerik */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>{renderContent()}</Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
