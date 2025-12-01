import { useState, useEffect } from 'react';
import { productAPI } from '../utils/api';
import { mockProducts } from '../data/mockData';

// Backend hazır olduğunda gerçek API'ye geçiş için hook
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Backend hazır olduğunda bu satırı aktif et:
      // const response = await productAPI.getAll();
      // setProducts(response.data);
      
      // Şimdilik mock veri kullan
      await new Promise(resolve => setTimeout(resolve, 500)); // Simüle loading
      setProducts(mockProducts);
    } catch (err) {
      setError(err.message);
      // Hata durumunda da mock veri göster
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
};

export const useProduct = (slug) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Backend hazır olduğunda:
      // const response = await productAPI.getBySlug(slug);
      // setProduct(response.data);
      
      // Mock veri
      await new Promise(resolve => setTimeout(resolve, 300));
      const found = mockProducts.find(p => p.slug === slug);
      setProduct(found);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { product, loading, error, refetch: fetchProduct };
};
