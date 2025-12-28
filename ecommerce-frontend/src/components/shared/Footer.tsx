import { Link } from 'react-router-dom'
import { Store, Github, Twitter, Mail } from 'lucide-react'

/**
 * Footer Component
 * 
 * A clean, simple footer with site links and information.
 * Features:
 * - Company branding and description
 * - Navigation links organized by category
 * - Social media links
 * - Copyright information
 * - Responsive design
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Store className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">E-Commerce</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted online marketplace for quality products and exceptional service.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@example.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/products" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/categories" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link 
                  to="/brands" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Brands
                </Link>
              </li>
              <li>
                <Link 
                  to="/deals" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Special Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/profile" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link 
                  to="/orders" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Order History
                </Link>
              </li>
              <li>
                <Link 
                  to="/cart" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link 
                  to="/wishlist" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/help" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} E-Commerce. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link 
                to="/privacy" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookies" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer