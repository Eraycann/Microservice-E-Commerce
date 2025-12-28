/**
 * RecommendedProducts Bileşeni
 * 
 * Ana sayfada "Sizin İçin Önerilenler" bölümü
 * Backend RecommendationService ile entegre
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { recommendationService, RecommendationUtils } from '@/services/recommendationService'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  TrendingUp
} from 'lucide-react'
import type { RecommendationProps } from '@/types/recommendation'

export const RecommendedProducts: React.FC<RecommendationProps> = ({
  userId,
  guestId,
  title = 'Sizin İçin Önerilenler',
  maxItems = 8,
  showTitle = true,
  className = ''
}) => {
  const { user } = useAuth()
  
  // Kullanıcı ID'lerini belirle
  const effectiveUserId = userId || user?.id
  const effectiveGuestId = guestId || (!effectiveUserId ? RecommendationUtils.getOrCreateGuestId() : undefined)

  // Önerileri getir
  const { 
    data: recommendations, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['recommendations', effectiveUserId, effectiveGuestId],
    queryFn: () => recommendationService.getRecommendations(effectiveGuestId),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika (cacheTime yerine gcTime)
    retry: 1, // Fallback mekanizması var, fazla retry'a gerek yok
    refetchOnWindowFocus: false
  })

  // Maksimum ürün sayısını uygula
  const displayedRecommendations = recommendations?.slice(0, maxItems) || []

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className={`bg-card border rounded-lg p-6 ${className}`}>
        {showTitle && (
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
        )}
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
          <span className="text-muted-foreground">Öneriler yükleniyor...</span>
        </div>
      </div>
    )
  }

  // Hata durumu
  if (error && (!recommendations || recommendations.length === 0)) {
    return (
      <div className={`bg-card border rounded-lg p-6 ${className}`}>
        {showTitle && (
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
        )}
        
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">
            Öneriler yüklenirken bir sorun oluştu
          </p>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            {isRefetching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Yeniden Yükleniyor...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tekrar Dene
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Öneri yoksa gösterme
  if (!displayedRecommendations || displayedRecommendations.length === 0) {
    return null
  }

  return (
    <div className={`bg-card border rounded-lg p-6 ${className}`}>
      {/* Başlık */}
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{title}</h2>
            {effectiveUserId && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                Kişiselleştirilmiş
              </span>
            )}
            {!effectiveUserId && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                Popüler
              </span>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-muted-foreground hover:text-foreground"
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Ürün Grid'i */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedRecommendations.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              imageUrls: [product.imageUrl],
              description: '',
              category: { id: '1', name: 'Genel', slug: 'genel' },
              brand: { id: '1', name: 'Genel', slug: 'genel' },
              inStock: true,
              stockQuantity: 1,
              rating: 0,
              reviewCount: 0,
              tags: [],
              createdAt: '',
              updatedAt: '',
              currency: 'TRY',
              originalPrice: undefined
            }}
            onProductClick={(productId) => {
              // Ürün görüntüleme etkileşimini kaydet
              recommendationService.trackProductView(
                productId.toString(), 
                effectiveUserId, 
                effectiveGuestId
              )
            }}
            onAddToCart={(productId) => {
              // Sepete ekleme etkileşimini kaydet
              recommendationService.trackAddToCart(
                productId.toString(), 
                effectiveUserId, 
                effectiveGuestId
              )
            }}
          />
        ))}
      </div>

      {/* Daha Fazla Göster */}
      {recommendations && recommendations.length > maxItems && (
        <div className="text-center mt-6">
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Daha Fazla Öneri Gör
          </Button>
        </div>
      )}

      {/* Fallback Uyarısı */}
      {error && recommendations && recommendations.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>
              Kişiselleştirilmiş öneriler şu anda kullanılamıyor. Popüler ürünler gösteriliyor.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecommendedProducts