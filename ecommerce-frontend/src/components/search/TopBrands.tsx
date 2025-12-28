/**
 * Top Brands Component
 * 
 * Displays popular brands from SearchService
 * Uses backend /api/v1/search/top-brands endpoint
 */

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { searchService } from '@/services/searchService'
import { useNavigate } from 'react-router-dom'
import { 
  Building, 
  TrendingUp, 
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react'

interface TopBrandsProps {
  title?: string
  maxBrands?: number
  showTitle?: boolean
  className?: string
}

export const TopBrands: React.FC<TopBrandsProps> = ({
  title = "Popüler Markalar",
  maxBrands = 8,
  showTitle = true,
  className = ""
}) => {
  const navigate = useNavigate()

  // Fetch top brands from SearchService
  const {
    data: topBrands = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['search', 'top-brands'],
    queryFn: () => searchService.getTopBrands(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2
  })

  const handleBrandClick = (brandName: string) => {
    // Navigate to products page filtered by brand
    navigate(`/products?brand=${encodeURIComponent(brandName)}`)
  }

  const displayBrands = topBrands.slice(0, maxBrands)

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showTitle && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground">
              En çok tercih edilen markalar
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Markalar yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showTitle && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground">
              En çok tercih edilen markalar
            </p>
          </div>
        )}
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="font-medium text-red-900 mb-2">
                Markalar yüklenirken hata oluştu
              </p>
              <p className="text-sm text-red-700">
                {error instanceof Error ? error.message : 'Bilinmeyen hata'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (displayBrands.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showTitle && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground">
              En çok tercih edilen markalar
            </p>
          </div>
        )}
        
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Henüz popüler marka yok
              </h3>
              <p className="text-muted-foreground">
                Markalar yakında burada görünecek.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showTitle && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">
            En çok tercih edilen markalar
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {displayBrands.map((brandName, index) => (
          <BrandCard
            key={`${brandName}-${index}`}
            brandName={brandName}
            onClick={() => handleBrandClick(brandName)}
          />
        ))}
      </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/products')}
          >
            Tüm Ürünleri Gör
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
    </div>
  )
}

// Brand Card Component
interface BrandCardProps {
  brandName: string
  onClick: () => void
}

const BrandCard: React.FC<BrandCardProps> = ({ brandName, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-primary"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          {/* Brand Icon */}
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Building className="w-6 h-6 text-primary" />
          </div>
          
          {/* Brand Name */}
          <div>
            <h3 className="font-semibold text-sm line-clamp-1">
              {brandName}
            </h3>
            <div className="flex items-center justify-center mt-1">
              <TrendingUp className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">
                Popüler
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TopBrands