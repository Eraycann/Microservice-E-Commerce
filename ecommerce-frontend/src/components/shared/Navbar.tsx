import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search'
import { LoginButton, UserProfile, useAuth } from '@/features/auth'
import { CartIcon } from '@/components/cart'
import { 
  Menu, 
  X, 
  Store,
  User,
  Package,
  Shield
} from 'lucide-react'

/**
 * Navbar Component
 * 
 * The main navigation bar that serves as the command center of the application.
 * Features:
 * - Responsive design with mobile hamburger menu
 * - Logo with home link
 * - Search bar with auto-complete functionality
 * - Cart icon with item count badge
 * - Authentication-aware user section
 * - Sticky positioning at top of page
 */
export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()

  // Admin button will be shown for all authenticated users
  // Backend will handle authorization when they try to access admin pages

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
              onClick={closeMobileMenu}
            >
              <Store className="w-6 h-6" />
              <span className="hidden sm:block">E-Commerce</span>
            </Link>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar 
              placeholder="Ürün ara..."
              size="md"
              showSuggestions={true}
            />
          </div>

          {/* Right: Cart + Auth (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Icon */}
            <CartIcon />

            {/* Authentication Section */}
            <div className="flex items-center space-x-2">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-2">
                  {/* Admin Panel Link - Show for all authenticated users */}
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                  
                  <Link to="/profile">
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      {user.firstName}
                    </Button>
                  </Link>
                  <UserProfile variant="minimal" />
                </div>
              ) : (
                <LoginButton variant="default" size="sm" />
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart Icon */}
            <CartIcon size="sm" />

            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <SearchBar 
                  placeholder="Ürün ara..."
                  size="md"
                  showSuggestions={true}
                />
              </div>

              {/* Mobile Navigation Links */}
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Ana Sayfa
              </Link>

              <Link
                to="/products"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Ürünler
              </Link>

              {/* Admin Link for Mobile - Show for all authenticated users */}
              {isAuthenticated && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 text-base font-medium text-orange-600 hover:text-orange-700 hover:bg-accent rounded-md transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Admin Panel
                </Link>
              )}

              {/* Mobile Authentication Section */}
              <div className="px-3 py-2 border-t">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="block py-2 text-base font-medium text-foreground hover:text-primary transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      Profil ({user.firstName})
                    </Link>
                    <div className="pt-2">
                      <UserProfile variant="compact" />
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <LoginButton variant="default" size="sm" className="w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar