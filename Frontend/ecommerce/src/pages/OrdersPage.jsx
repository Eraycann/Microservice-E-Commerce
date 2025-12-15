import { Container, Typography, Box, Paper, Chip, Button, Stepper, Step, StepLabel } from '@mui/material';
import { ShoppingBag, LocalShipping, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Mock sipariş verisi
  const orders = [];

  if (!user) {
    login();
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipping': return 'info';
      case 'preparing': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Teslim Edildi';
      case 'shipping': return 'Kargoda';
      case 'preparing': return 'Hazırlanıyor';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        Siparişlerim
      </Typography>

      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingBag sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Henüz siparişiniz bulunmamaktadır
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Alışverişe başlayarak ilk siparişinizi oluşturabilirsiniz.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
            Alışverişe Başla
          </Button>
        </Box>
      ) : (
        <Box>
          {orders.map((order) => (
            <Paper key={order.id} sx={{ p: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sipariş No: {order.orderNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.date}
                  </Typography>
                </Box>
                <Chip
                  label={getStatusText(order.status)}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </Box>

              <Stepper activeStep={order.step} alternativeLabel sx={{ mb: 2 }}>
                <Step>
                  <StepLabel>Sipariş Alındı</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Hazırlanıyor</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Kargoya Verildi</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Teslim Edildi</StepLabel>
                </Step>
              </Stepper>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  ₺{order.total.toLocaleString('tr-TR')}
                </Typography>
                <Button variant="outlined" size="small">
                  Detayları Gör
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default OrdersPage;
