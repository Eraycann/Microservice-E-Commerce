/**
 * AddToCartButton Bileşeni
 * 
 * Backend CartController API'sına uygun sepete ekleme butonu:
 * POST /api/v1/cart/items { productId: number, quantity: number }
 */

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { cartService } from '@/services/cartService'
import { ShoppingCart, Plus, Minus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AddToCartButtonProps {
  /** Ürün ID'si (Backend Long bekliyor) */
  productId: number
  /** Ürün adı (hata mesajları için) */
  productName?: string
  /** Stok durumu */
  inStock?: boolean
  /** Stok miktarı */
  stockQuantity?: number
  /** Buton varyantı */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  /** Buton boyutu */
  size?: 'sm' | 'default' | 'lg'
  /** Miktar seçici gösterilsin mi */
  showQuantitySelector?: boolean
  /** Başlangıç miktarı */
  initialQuantity?: number
  /** Maksimum miktar */
  maxQuantity?: number
  /** Tam genişlik */
  fullWidth?: boolean
  /** Özel CSS sınıfları */
  className?: string
  /** Başarı callback'i */
  onSuccess?: (quantity: number) => void
  /** Hata callback'i */
  onError?: (error: string) => void
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  productName = 'Ürün',
  inStock = true,
  stockQuantity = 999,
  variant = 'default',
  size = 'default',
  showQuantitySelector = false,
  initialQuantity = 1,
  maxQuantity = 10,
  fullWidth = false,
  className,
  onSuccess,
  onError
}) => {
  const [quantity, setQuantity] = useState(initialQuantity)
  const queryClient = useQueryClient()

  // Sepete ekleme mutation'ı
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return cartService.addToCart({ productId, quantity })
    },
    onSuccess: () => {
      // Cart query'lerini güncelle
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      
      // Başarı mesajı
      toast.success(`${productName} sepete eklendi (${quantity} adet)`)
      
      // Başarı callback'i
      onSuccess?.(quantity)
      
      console.log('[AddToCartButton] Ürün sepete eklendi:', {
        productId,
        quantity
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Ürün sepete eklenirken hata oluştu'
      toast.error(errorMessage)
      onError?.(errorMessage)
      console.error('[AddToCartButton] Sepete ekleme hatası:', error)
    }
  })

  // Miktar artırma
  const incrementQuantity = () => {
    if (quantity < Math.min(maxQuantity, stockQuantity)) {
      setQuantity(prev => prev + 1)
    }
  }

  // Miktar azaltma
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  // Sepete ekleme
  const handleAddToCart = () => {
    if (!inStock) {
      toast.error('Bu ürün stokta bulunmuyor')
      onError?.('Bu ürün stokta bulunmuyor')
      return
    }

    if (quantity > stockQuantity) {
      toast.error(`Maksimum ${stockQuantity} adet ekleyebilirsiniz`)
      onError?.(`Maksimum ${stockQuantity} adet ekleyebilirsiniz`)
      return
    }

    addToCartMutation.mutate()
  }

  const isLoading = addToCartMutation.isPending
  const isDisabled = !inStock || isLoading || quantity > stockQuantity

  return (
    <div className={cn('flex items-center gap-2', fullWidth && 'w-full')}>
      {/* Miktar Seçici */}
      {showQuantitySelector && (
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={decrementQuantity}
            disabled={quantity <= 1 || isLoading}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
            {quantity}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={incrementQuantity}
            disabled={quantity >= Math.min(maxQuantity, stockQuantity) || isLoading}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Sepete Ekle Butonu */}
      <Button
        variant={variant}
        size={size}
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={cn(
          'flex items-center gap-2',
          fullWidth && 'flex-1',
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
        
        {isLoading ? (
          'Ekleniyor...'
        ) : !inStock ? (
          'Stokta Yok'
        ) : showQuantitySelector ? (
          'Sepete Ekle'
        ) : (
          `Sepete Ekle${quantity > 1 ? ` (${quantity})` : ''}`
        )}
      </Button>
    </div>
  )
}

/**
 * Hızlı sepete ekleme butonu (miktar seçici olmadan)
 */
export const QuickAddToCartButton: React.FC<Omit<AddToCartButtonProps, 'showQuantitySelector'>> = (props) => {
  return <AddToCartButton {...props} showQuantitySelector={false} />
}

/**
 * Detaylı sepete ekleme butonu (miktar seçici ile)
 */
export const DetailedAddToCartButton: React.FC<Omit<AddToCartButtonProps, 'showQuantitySelector'>> = (props) => {
  return <AddToCartButton {...props} showQuantitySelector={true} />
}