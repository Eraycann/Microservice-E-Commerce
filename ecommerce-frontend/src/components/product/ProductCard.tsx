/**
 * ProductCard Component
 * 
 * A reusable card component for displaying product information in grids and lists.
 * Features:
 * - Responsive design that works in various grid layouts
 * - Product image with fallback handling
 * - Price display with sale price support
 * - Star rating display
 * - Add to cart functionality
 * - Hover effects and smooth transitions
 */

import { Link } from 'react-router-dom'
import { QuickAddToCartButton } from '@/components/cart'
import { ImageUtils } from '@/services/productService'
import { Star } from 'lucide-react'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'featured'
  showAddToCart?: boolean
  className?: string
  onProductClick?: (productId: number) => void
  onAddToCart?: (productId: number) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
  showAddToCart = true,
  className = '',
  onProductClick,
  onAddToCart
}) => {
  const primaryImageUrl = ImageUtils.getPrimaryImageUrl(product, 'medium')
  const isOnSale = product.originalPrice && product.originalPrice > product.price

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      )
    }

    return stars
  }

  const cardClasses = {
    default: 'group bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden',
    compact: 'group bg-card rounded-md border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden',
    featured: 'group bg-card rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden'
  }

  const imageClasses = {
    default: 'aspect-square',
    compact: 'aspect-square',
    featured: 'aspect-[4/3]'
  }

  return (
    <Link 
      to={`/products/${product.id}`}
      className={`${cardClasses[variant]} ${className}`}
      onClick={() => onProductClick?.(Number(product.id))}
    >
      {/* Product Image */}
      <div className={`relative ${imageClasses[variant]} overflow-hidden bg-gray-50`}>
        <img
          src={primaryImageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
        
        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Sale
          </div>
        )}

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}

        {/* Quick Add to Cart (on hover) */}
        {showAddToCart && product.inStock && variant === 'default' && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <QuickAddToCartButton
              productId={Number(product.id)}
              productName={product.name}
              inStock={product.inStock}
              stockQuantity={product.stockQuantity}
              size="sm"
              className="shadow-lg"
              onSuccess={() => onAddToCart?.(Number(product.id))}
            />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={`p-4 ${variant === 'compact' ? 'p-3' : ''}`}>
        {/* Brand */}
        <div className="text-sm text-muted-foreground mb-1">
          {product.brand.name}
        </div>

        {/* Product Name */}
        <h3 className={`font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors ${
          variant === 'compact' ? 'text-sm' : 'text-base'
        }`}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-muted-foreground ml-1">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`font-bold text-foreground ${
            variant === 'compact' ? 'text-base' : 'text-lg'
          }`}>
            {product.currency} {product.price.toFixed(2)}
          </span>
          {isOnSale && (
            <span className="text-sm text-muted-foreground line-through">
              {product.currency} {product.originalPrice!.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button (always visible on compact/featured) */}
        {showAddToCart && (variant === 'compact' || variant === 'featured') && (
          <QuickAddToCartButton
            productId={Number(product.id)}
            productName={product.name}
            inStock={product.inStock}
            stockQuantity={product.stockQuantity}
            fullWidth={true}
            size={variant === 'compact' ? 'sm' : 'default'}
            onSuccess={() => onAddToCart?.(Number(product.id))}
          />
        )}
      </div>
    </Link>
  )
}

export default ProductCard