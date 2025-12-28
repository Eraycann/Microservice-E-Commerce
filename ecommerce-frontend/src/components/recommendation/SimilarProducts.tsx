import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { recommendationService } from '@/services/recommendationService'
import { ProductCard } from '@/components/product/ProductCard'
import { AlertCircle } from 'lucide-react'

interface SimilarProductsProps {
  currentProductId: string
  currentProductSlug?: string // Slug da gelebilir, opsiyonel
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({ currentProductId }) => {
  
  // Servisten veriyi çekiyoruz
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['similar-products', currentProductId],
    queryFn: () => recommendationService.getSimilarProducts(currentProductId),
    staleTime: 1000 * 60 * 5, // 5 dakika cache
    retry: 1
  })

  // Yükleniyor Durumu (Skeleton)
if (isLoading) {
    return (
      <div className="space-y-4 mt-12 py-8 border-t">
        <h2 className="text-2xl font-bold">Benzer Ürünler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              {/* Skeleton yerine basit div'ler */}
              <div className="h-[200px] w-full bg-gray-200 rounded-xl" />
              <div className="h-4 w-[250px] bg-gray-200 rounded" />
              <div className="h-4 w-[200px] bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Hata varsa veya ürün yoksa hiçbir şey gösterme (Sessizce gizle)
  if (error || !products || products.length === 0) {
    return null
  }

  // Veri geldiyse
  return (
    <div className="mt-16 border-t pt-10 pb-10">
      <div className="flex items-center gap-2 mb-6">
        {/* Başlık */}
        <h2 className="text-2xl font-bold">Sizin İçin Seçtiklerimiz</h2>
        <span className="text-sm text-muted-foreground ml-2">({products.length} ürün)</span>
      </div>
      
      {/* Ürün Izgarası */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          // ProductCard'a "any" olarak cast edip gönderiyoruz çünkü servisimiz artık uyumlu format dönüyor
          <ProductCard 
            key={product.id} 
            product={product as any} 
            variant="default" 
          />
        ))}
      </div>
    </div>
  )
}

// Default export önemli, çünkü lazy load yapılıyor olabilir
export default SimilarProducts