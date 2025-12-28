import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { MegaMenu } from '@/components/navigation/MegaMenu'
import { CartDrawer } from '@/components/cart'
import { useCartSync } from '@/hooks/useCartSync'
import { useCartMerge } from '@/hooks/useCartMerge'

/**
 * MainLayout Component
 * 
 * The main layout wrapper that provides the consistent structure for all pages.
 * Features:
 * - Sticky navbar at the top
 * - Main content area with proper spacing
 * - Footer at the bottom
 * - Cart drawer overlay
 * - Cart synchronization across tabs
 * - Cart merge on user login
 * - Responsive design
 * - Proper semantic HTML structure
 */
export const MainLayout: React.FC = () => {
  // Sepet senkronizasyonunu başlat
  useCartSync()
  
  // Sepet birleştirme işlemini başlat
  useCartMerge()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Navbar />
      
      {/* Mega Menu */}
      <MegaMenu />
      
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  )
}

export default MainLayout