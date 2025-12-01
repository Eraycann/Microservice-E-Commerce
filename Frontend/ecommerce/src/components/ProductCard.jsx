import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/product/${product.slug}`)}
      sx={{
        width: '100%',
        cursor: 'pointer',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        bgcolor: 'white',
        overflow: 'hidden',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderColor: 'primary.main',
        },
      }}
    >
      {/* Görsel Alanı - Sabit 150px */}
      <Box
        sx={{
          width: '100%',
          height: 150,
          bgcolor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
        }}
      >
        <Box
          component="img"
          src={product.images?.[0]?.imageUrl || 'https://via.placeholder.com/120x100/f5f5f5/999999?text=Ürün'}
          alt={product.name}
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* İçerik Alanı - Sabit 100px */}
      <Box sx={{ p: 1.5, height: 100 }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}
        >
          {product.brandName}
        </Typography>
        
        <Typography 
          sx={{ 
            fontSize: '0.8rem',
            fontWeight: 500,
            lineHeight: 1.3,
            height: 34,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 1,
          }}
        >
          {product.name}
        </Typography>

        <Typography 
          sx={{ 
            fontSize: '0.95rem', 
            fontWeight: 600, 
            color: 'primary.main',
            mb: 0.3,
          }}
        >
          ₺{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </Typography>
        
        <Typography 
          sx={{ 
            fontSize: '0.65rem', 
            color: product.stockCount > 0 ? 'success.main' : 'error.main',
            fontWeight: 500,
          }}
        >
          {product.stockCount > 0 ? 'Stokta' : 'Stokta Yok'}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProductCard;
