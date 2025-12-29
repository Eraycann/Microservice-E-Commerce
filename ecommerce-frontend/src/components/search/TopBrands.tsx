/**
 * Top Brands Component
 * Displays popular brands using BrandService
 */

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { brandService } from '@/services/brandService' // 👇 SearchService DEĞİL, BrandService
import { useNavigate } from 'react-router-dom'
import type { Brand } from '@/services/brandService'
import { 
  Building, // İkonu da güncelledim (veya Tag kullanabilirsin)
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

  // 👇 BrandService.getTopBrands kullanıyoruz
  const {
    data: topBrands = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['brands', 'top'], // Query key güncellendi
    queryFn: () => brandService.getTopBrands(maxBrands),
    staleTime: 1000 * 60 * 30, // 30 dakika
    retry: 2
  })

  const handleBrandClick = (brandName: string) => {
    navigate(`/products?brand=${encodeURIComponent(brandName)}`)
  }

  // Slice işlemi zaten serviste yapılıyor ama garanti olsun
  const displayBrands = topBrands.slice(0, maxBrands)

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showTitle && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground">En çok tercih edilen markalar</p>
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
          </div>
        )}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="font-medium text-red-900 mb-2">Markalar yüklenirken hata oluştu</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (displayBrands.length === 0) {
    return null // Veri yoksa gösterme
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showTitle && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">En çok tercih edilen markalar</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {displayBrands.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={brand} // Obje gönderiyoruz
            onClick={() => handleBrandClick(brand.name)}
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
  brand: Brand
  onClick: () => void
}

const BrandCard: React.FC<BrandCardProps> = ({ brand, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-primary group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          {/* Brand Icon / Logo */}
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
            {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} className="w-8 h-8 object-contain" />
            ) : (
                <Building className="w-6 h-6 text-primary" />
            )}
          </div>
          
          {/* Brand Name */}
          <div>
            <h3 className="font-semibold text-sm line-clamp-1">
              {brand.name}
            </h3>
            <div className="flex items-center justify-center mt-1">
              <TrendingUp className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Popüler</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TopBrands