import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthActions } from '@/features/auth'
import { ProtectedRoute } from '@/features/auth'
import MainLayout from '@/components/shared/MainLayout'
import { 
  HomePage, 
  ProfilePage, 
  CartPage, 
  ProductDetailPage,
  ProductsPage,
  SearchResultsPage,
  CheckoutPage,
  OrdersPage,
  NotFoundPage 
} from '@/pages'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import CategoryManagement from '@/pages/admin/CategoryManagement'
import BrandManagement from '@/pages/admin/BrandManagement'
import QuestionManagement from '@/pages/admin/QuestionManagement'
import ProductManagement from '@/pages/admin/ProductManagement'

function App() {
  const { checkAuth } = useAuthActions()

  // Check authentication status on app load
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="checkout" 
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="orders" 
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="orders/:orderNumber" 
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/categories" 
              element={
                <ProtectedRoute>
                  <CategoryManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/brands" 
              element={
                <ProtectedRoute>
                  <BrandManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/questions" 
              element={
                <ProtectedRoute>
                  <QuestionManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/questions/:id" 
              element={
                <ProtectedRoute>
                  <QuestionManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/products" 
              element={
                <ProtectedRoute>
                  <ProductManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/products/new" 
              element={
                <ProtectedRoute>
                  <ProductManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/products/:id" 
              element={
                <ProtectedRoute>
                  <ProductManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
    </>
  )
}

export default App