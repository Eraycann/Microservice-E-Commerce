import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Drawer,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FilterList, Close } from '@mui/icons-material';
import { mockProducts, mockCategories } from '../data/mockData';
import ProductCard from '../components/ProductCard';

const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [products, setProducts] = useState(mockProducts);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Filtreler
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    filterProducts();
  }, [categorySlug, searchQuery, selectedCategories, selectedBrands, priceRange]);

  const filterProducts = () => {
    let filtered = [...mockProducts];

    // Kategori filtresi
    if (categorySlug) {
      filtered = filtered.filter(p => p.categoryName.toLowerCase().includes(categorySlug));
    }

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.brandName.toLowerCase().includes(query)
      );
    }

    // Seçili kategoriler
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.categoryName));
    }

    // Seçili markalar
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brandName));
    }

    // Fiyat aralığı
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    setProducts(filtered);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 100000]);
  };

  // Benzersiz kategoriler ve markalar
  const categories = [...new Set(mockProducts.map(p => p.categoryName))];
  const brands = [...new Set(mockProducts.map(p => p.brandName))];

  const FilterContent = () => (
    <Box sx={{ p: 3, width: isMobile ? 280 : 'auto' }}>
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filtreler</Typography>
          <IconButton onClick={() => setMobileFilterOpen(false)}>
            <Close />
          </IconButton>
        </Box>
      )}

      {/* Fiyat Aralığı */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Fiyat Aralığı
        </Typography>
        <Slider
          value={priceRange}
          onChange={(e, newValue) => setPriceRange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={100000}
          step={1000}
          sx={{ mt: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption">₺{priceRange[0].toLocaleString()}</Typography>
          <Typography variant="caption">₺{priceRange[1].toLocaleString()}</Typography>
        </Box>
      </Box>

      {/* Kategoriler */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Kategoriler
        </Typography>
        <FormGroup>
          {categories.map(category => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  sx={{ color: 'primary.main' }}
                />
              }
              label={category}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Markalar */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Markalar
        </Typography>
        <FormGroup>
          {brands.map(brand => (
            <FormControlLabel
              key={brand}
              control={
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                  sx={{ color: 'primary.main' }}
                />
              }
              label={brand}
            />
          ))}
        </FormGroup>
      </Box>

      <Button
        variant="outlined"
        fullWidth
        onClick={clearFilters}
      >
        Filtreleri Temizle
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={2}>
        {/* Sol Sidebar - Desktop */}
        {!isMobile && (
          <Grid item md={2.5}>
            <Box sx={{ position: 'sticky', top: 80, bgcolor: 'background.paper', borderRadius: 2 }}>
              <FilterContent />
            </Box>
          </Grid>
        )}

        {/* Ürün Listesi */}
        <Grid item xs={12} md={9.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Tüm Ürünler'}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({products.length} ürün)
              </Typography>
            </Typography>
            
            {isMobile && (
              <Button
                startIcon={<FilterList />}
                variant="outlined"
                size="small"
                onClick={() => setMobileFilterOpen(true)}
              >
                Filtrele
              </Button>
            )}
          </Box>

          {products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body1" color="text.secondary">
                Ürün bulunamadı
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {products.map(product => (
                <Grid item xs={6} sm={4} md={3} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
      >
        <FilterContent />
      </Drawer>
    </Container>
  );
};

export default ProductListPage;
