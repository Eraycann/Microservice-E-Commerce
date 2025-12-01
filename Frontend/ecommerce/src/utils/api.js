import axios from 'axios';
import Cookies from 'js-cookie';

const GATEWAY_URL = 'http://localhost:8080';

// Axios instance oluştur
const api = axios.create({
  baseURL: GATEWAY_URL,
  withCredentials: true, // Cookie'leri otomatik gönder
});

// CSRF Token okuma fonksiyonu
const getCsrfToken = () => {
  const token = Cookies.get('XSRF-TOKEN');
  if (!token) {
    console.warn('CSRF Token bulunamadı!');
  }
  return token;
};

// Request interceptor - Her istekte CSRF token ekle
api.interceptors.request.use(
  (config) => {
    // POST, PUT, DELETE gibi veri değiştiren isteklerde CSRF token ekle
    if (['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // 401 - Oturum yok, login'e yönlendir
      if (status === 401) {
        console.warn('Oturum bulunamadı, giriş yapmanız gerekiyor.');
        // Login sayfasına yönlendirme yapılabilir
      }
      
      // 403 - Yetkisiz erişim
      if (status === 403) {
        console.error('Bu işlem için yetkiniz yok!');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // OAuth2 login'e yönlendir
  login: () => {
    window.location.href = `${GATEWAY_URL}/oauth2/authorization/keycloak`;
  },
  
  // Logout (Form submit ile)
  logout: () => {
    const csrfToken = getCsrfToken();
    if (!csrfToken) {
      alert('CSRF Token bulunamadı! Sayfayı yenileyip tekrar deneyin.');
      return;
    }
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${GATEWAY_URL}/logout`;
    
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = '_csrf';
    hiddenField.value = csrfToken;
    
    form.appendChild(hiddenField);
    document.body.appendChild(form);
    form.submit();
  },
  
  // Kullanıcı bilgisini al (session kontrolü)
  checkAuth: async () => {
    try {
      const response = await api.get('/api/v1/users/me');
      return response.data;
    } catch (error) {
      return null;
    }
  }
};

// Product API
export const productAPI = {
  getAll: () => api.get('/api/v1/products'),
  getById: (id) => api.get(`/api/v1/products/${id}`),
  getBySlug: (slug) => api.get(`/api/v1/products/slug/${slug}`),
  getCartDetail: (id) => api.get(`/api/v1/products/${id}/cart-detail`),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/api/v1/categories'),
  getById: (id) => api.get(`/api/v1/categories/${id}`),
};

// Cart API (Auth gerekli)
export const cartAPI = {
  get: () => api.get('/api/v1/cart'),
  addItem: (productId, quantity) => api.post('/api/v1/cart/items', { productId, quantity }),
  removeItem: (productId) => api.delete(`/api/v1/cart/items/${productId}`),
  clear: () => api.delete('/api/v1/cart'),
};

// Review API
export const reviewAPI = {
  getByProduct: (productId, page = 0, size = 10) => 
    api.get(`/api/reviews/${productId}?page=${page}&size=${size}`),
  getSummary: (productId) => api.get(`/api/reviews/summary/${productId}`),
  add: (formData) => api.post('/api/reviews', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  vote: (reviewId) => api.post(`/api/reviews/${reviewId}/vote`),
};

export default api;
