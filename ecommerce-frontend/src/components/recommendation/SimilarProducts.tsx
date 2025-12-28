/**
 * SimilarProducts Bileşeni
 * 
 * Ürün detay sayfasında "Benzer Ürünler" veya "Bunu Alanlar Şunu da Aldı" bölümü
 * Backend RecommendationService ile entegre
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { recommendationService, RecommendationUtils } from '@/services/recommendationService'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Loader2, 
  RefreshCw,
  ShoppingBag,
  Eye
} from 'lucide-react'
import type { SimilarProductsProps } from '@/types/recommendation'

export const SimilarProducts: React.FC<SimilarProductsProps> = ({
  currentProductId,
  userId,
  guestId,
  title = 'Benzer Ürünler',
  maxItems = 6,
  className = ''
}) => {
  const { user } = useAuth()
  
  // Kullanıcı ID'lerini belirle
  const effectiveUserId = userId || user?.id
  const effectiveGuestId = guestId || (!effectiveUserId ? RecommendationUtils.getOrCreateGuestId() : undefined)

  console.log('[SimilarProducts] Render params:', {
    currentProductId,
    effectiveUserId,
    effectiveGuestId,
    userAuthenticated: !!user
  })

  // Benzer ürünleri getir
  const { 
    data: similarProducts, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['similar-products', currentProductId, effectiveUserId, effectiveGuestId],
    queryFn: () => {
      console.log('[SimilarProducts] API çağrısı yapılıyor:', {
        currentProductId,
        effectiveUserId,
        effectiveGuestId
      })
      return recommendationService.getSimilarProducts(
        currentProductId, 
        effectiveUserId, 
        effectiveGuestId
      )
    },
    staleTime: 10 * 60 * 1000, // 10 dakika
    gcTime: 15 * 60 * 1000, // 15 dakika (cacheTime yerine gcTime)
    retry: 2, // Retry sayısını artır
    refetchOnWindowFocus: false,
    enabled: !!currentProductId // Sadece productId varsa çalıştır
  })

  // Maksimum ürün sayısını uygula
  const displayedProducts = similarProducts?.slice(0, maxItems) || []

  console.log('[SimilarProducts] Render state:', {
    isLoading,
    error: error?.message,
    productsCount: displayedProducts.length,
    products: displayedProducts.map(p => ({ id: p.id, name: p.name }))
  })

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className={`bg-card border rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
          <span className="text-muted-foreground">Benzer ürünler yükleniyor...</span>
        </div>
      </div>
    )
  }

  // Hata durumu - Artık gizleme, hata mesajı göster
  if (error) {
    console.error('[SimilarProducts] Hata:', error)
    return (
      <div className={`bg-card border rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Benzer ürünler yüklenirken bir hata oluştu</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </div>
      </div>
    )
  }

  // Ürün yoksa gösterme
  if (!displayedProducts || displayedProducts.length === 0) {
    return (
      <div className={`bg-card border rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        
        <div className="text-center py-8">
          <p className="text-muted-foreground">Henüz benzer ürün bulunamadı</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-card border rounded-lg p-6 ${className}`}>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
            {displayedProducts.length} ürün
          </span>
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

      {/* Ürün Grid'i */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {displayedProducts.map((product) => (
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
            variant="compact" // Daha kompakt görünüm
          />
        ))}
      </div>

      {/* İstatistikler */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>Bu ürünü görüntüleyenler</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              <span>Bu ürünleri de beğendi</span>
            </div>
          </div>
          
          {effectiveUserId && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              Size özel
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default SimilarProducts