/**
 * ProductGrid Component
 * 
 * A responsive grid layout for displaying multiple products.
 * Features:
 * - Responsive grid that adapts to screen size
 * - Loading states with skeleton placeholders
 * - Empty state handling
 * - Pagination support
 * - Configurable grid columns and spacing
 */

import { ProductCard } from './ProductCard'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { Product } from '@/types/product'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  showAddToCart?: boolean
  variant?: 'default' | 'compact' | 'featured'
  columns?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  onLoadMore?: () => void
  hasMore?: boolean
  loadingMore?: boolean
  className?: string
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  error = null,
  emptyMessage = 'No products found',
  showAddToCart = true,
  variant = 'default',
  columns = { sm: 2, md: 3, lg: 4, xl: 5 },
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  className = ''
}) => {
  // Generate grid classes based on columns configuration
  const gridClasses = [
    'grid gap-4',
    `grid-cols-${columns.sm || 2}`,
    `md:grid-cols-${columns.md || 3}`,
    `lg:grid-cols-${columns.lg || 4}`,
    `xl:grid-cols-${columns.xl || 5}`
  ].join(' ')

  // Loading skeleton component
  const ProductSkeleton = () => (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  )

  // Error state
  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold">Error loading products</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className={`${gridClasses} ${className}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    )
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-muted-foreground">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9h.01M15 9h.01M9 15h.01M15 15h.01" />
          </svg>
          <p className="text-lg font-semibold text-foreground mb-2">No products found</p>
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Product Grid */}
      <div className={gridClasses}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={variant}
            showAddToCart={showAddToCart}
          />
        ))}
      </div>

      {/* Load More Button */}
      {onLoadMore && hasMore && (
        <div className="text-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={loadingMore}
            variant="outline"
            size="lg"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              'Load More Products'
            )}
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {loadingMore && (
        <div className={`${gridClasses} mt-4`}>
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGrid