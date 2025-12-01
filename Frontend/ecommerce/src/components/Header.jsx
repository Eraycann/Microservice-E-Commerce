import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Button,
  Container,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart,
  Person,
  Favorite,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  return (
    <Box>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: 56, py: 0.5, justifyContent: 'center' }}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', marginRight: 24 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.2rem',
                  color: 'primary.main',
                }}
              >
                TechShop
              </Typography>
            </Link>

            {/* Arama */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                width: 400,
                display: 'flex',
                bgcolor: '#f5f5f5',
                borderRadius: 1,
                px: 1.5,
                py: 0.5,
                mr: 2,
                border: '1px solid #e0e0e0',
                '&:focus-within': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: '1.2rem' }} />
              <InputBase
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, color: 'text.primary', fontSize: '0.85rem' }}
              />
            </Box>

            {/* Sağ taraf */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {/* Favoriler */}
              <IconButton
                size="small"
                onClick={() => {
                  if (!user) {
                    login();
                  } else {
                    navigate('/favorites');
                  }
                }}
                sx={{ color: 'text.secondary' }}
              >
                <Favorite fontSize="small" />
              </IconButton>

              {/* Sepet */}
              <IconButton
                size="small"
                onClick={() => {
                  if (!user) {
                    login();
                  } else {
                    navigate('/cart');
                  }
                }}
                sx={{ color: 'text.secondary' }}
              >
                <Badge badgeContent={0} color="secondary">
                  <ShoppingCart fontSize="small" />
                </Badge>
              </IconButton>

              {/* Kullanıcı */}
              {user ? (
                <>
                  <IconButton
                    size="small"
                    onClick={handleProfileMenuOpen}
                    sx={{ color: 'text.secondary' }}
                  >
                    <Person fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/hesabim'); }}>
                      Hesabım
                    </MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/orders'); }}>
                      Siparişlerim
                    </MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/favorites'); }}>
                      Favorilerim
                    </MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/notifications'); }}>
                      Bildirimler
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  onClick={login}
                  sx={{ 
                    ml: 1,
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    px: 2,
                  }}
                >
                  Giriş Yap
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Alt Menü - Kategoriler */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1.5, gap: 6 }}>
            <Button
              size="small"
              onClick={() => navigate('/products?category=telefon')}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.9rem', 
                color: 'text.primary', 
                minWidth: 'auto',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' }
              }}
            >
              Telefon
            </Button>
            <Button
              size="small"
              onClick={() => navigate('/products?category=bilgisayar')}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.9rem', 
                color: 'text.primary', 
                minWidth: 'auto',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' }
              }}
            >
              Bilgisayar
            </Button>
            <Button
              size="small"
              onClick={() => navigate('/products?category=tv-goruntu-ses')}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.9rem', 
                color: 'text.primary', 
                minWidth: 'auto',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' }
              }}
            >
              Tv & Ses
            </Button>
            <Button
              size="small"
              onClick={() => navigate('/products?category=bilgisayar-parcalari')}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.9rem', 
                color: 'text.primary', 
                minWidth: 'auto',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' }
              }}
            >
              Bileşenler
            </Button>
            <Button
              size="small"
              onClick={() => navigate('/products?category=aksesuar')}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.9rem', 
                color: 'text.primary', 
                minWidth: 'auto',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' }
              }}
            >
              Aksesuar
            </Button>
            <Button
              size="small"
              onClick={() => navigate('/products?category=oyun-hobi')}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.9rem', 
                color: 'text.primary', 
                minWidth: 'auto',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' }
              }}
            >
              Oyun & Hobi
            </Button>
            <Button
              size="small"
              onClick={() => navigate('/products?category=outlet')}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.9rem', 
                color: 'text.primary', 
                minWidth: 'auto',
                fontWeight: 500,
                '&:hover': { color: 'primary.main' }
              }}
            >
              Outlet
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Header;
