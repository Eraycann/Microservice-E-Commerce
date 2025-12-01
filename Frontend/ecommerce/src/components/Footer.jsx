import { Box, Container, Grid, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        mt: 8,
        borderTop: '1px solid rgba(0, 212, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #00d4ff 30%, #00ff88 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              TechShop
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Teknolojinin gücünü keşfedin. En yeni ürünler, en uygun fiyatlar.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Kurumsal
            </Typography>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Hakkımızda
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1 }}>
              İletişim
            </Link>
            <Link href="#" color="text.secondary" display="block">
              Kariyer
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Yardım
            </Typography>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1 }}>
              SSS
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Kargo & İade
            </Link>
            <Link href="#" color="text.secondary" display="block">
              Gizlilik Politikası
            </Link>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 TechShop. Tüm hakları saklıdır.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
