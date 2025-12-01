import { Container, Typography, Grid, Box, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { mockCategories } from '../data/mockData';
import { ChevronRight } from '@mui/icons-material';

const CategoriesPage = () => {
  const navigate = useNavigate();
  
  // Ana kategoriler ve alt kategorileri grupla
  const mainCategories = mockCategories.filter(cat => !cat.parent);
  
  const getSubCategories = (parentId) => {
    return mockCategories.filter(cat => cat.parent?.id === parentId);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
        Tüm Kategoriler
      </Typography>

      <Grid container spacing={3}>
        {mainCategories.map((mainCat) => {
          const subCategories = getSubCategories(mainCat.id);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={mainCat.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0, 212, 255, 0.2)',
                  },
                }}
              >
                <CardContent>
                  <Box
                    onClick={() => navigate(`/products?category=${mainCat.slug}`)}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                      pb: 2,
                      borderBottom: '2px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {mainCat.name}
                    </Typography>
                    <ChevronRight color="primary" />
                  </Box>

                  {subCategories.length > 0 && (
                    <Box>
                      {subCategories.map((subCat) => (
                        <Box
                          key={subCat.id}
                          onClick={() => navigate(`/products?category=${subCat.slug}`)}
                          sx={{
                            py: 1,
                            px: 2,
                            mb: 1,
                            borderRadius: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(0, 212, 255, 0.1)',
                              transform: 'translateX(4px)',
                            },
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {subCat.name}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default CategoriesPage;
