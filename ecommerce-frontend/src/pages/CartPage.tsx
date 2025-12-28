import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cartService } from '@/services/cartService'
import { useAuth } from '@/features/auth'
import CartUtils from '@/utils/cartUtils'
import type { CartItem } from '@/types/cart'
import { 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  ShoppingBag
} from 'lucide-react'

/**
 * CartPage Component
 * 
 * Tam özellikli sepet yönetimi sayfası:
 * - Gerçek sepet verilerini görüntüler
 * - Miktar güncelleme ve öğe kaldırma
 * - Sipariş özeti ve vergi hesaplamaları
 * - Ödeme sayfasına yönlendirme
 * - Boş sepet durumu
 */
export const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())

  // Sepet verilerini getir
  const { data: cart, isLoading, error, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 60, // 1 dakika
    refetchOnWindowFocus: false
  })

  // Miktar güncelleme mutation'ı
  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      cartService.updateCartItem(productId, quantity),
    onMutate: ({ productId }) => {
      setUpdatingItems(prev => new Set(prev).add(productId))
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart)
      queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] })
    },
    onError: (error) => {
      console.error('[CartPage] Miktar güncelleme hatası:', error)
    },
    onSettled: (_, __, { productId }) => {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  })

  // Öğe kaldırma mutation'ı
  const removeItemMutation = useMutation({
    mutationFn: (productId: number) => cartService.removeFromCart(productId),
    onMutate: (productId) => {
      setUpdatingItems(prev => new Set(prev).add(productId))
    },
    onSuccess: () => {
      // Sepeti yeniden getir
      refetch()
    },
    onError: (error) => {
      console.error('[CartPage] Öğe kaldırma hatası:', error)
    },
    onSettled: (_, __, productId) => {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  })

  // Sepeti temizleme mutation'ı
  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      // Sepeti yeniden getir
      refetch()
    },
    onError: (error) => {
      console.error('[CartPage] Sepet temizleme hatası:', error)
    }
  })

  // Miktar güncelleme
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantityMutation.mutate({ productId, quantity: newQuantity })
  }

  // Öğe kaldırma
  const removeItem = (productId: number) => {
    removeItemMutation.mutate(productId)
  }

  // Sepeti temizle
  const clearCart = () => {
    if (window.confirm('Sepetinizdeki tüm ürünleri kaldırmak istediğinizden emin misiniz?')) {
      clearCartMutation.mutate()
    }
  }

  // Ödemeye git
  const goToCheckout = () => {
    navigate('/checkout')
  }

  // Alışverişe devam et
  const continueShopping = () => {
    navigate('/')
  }

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span className="text-lg">Sepet yükleniyor...</span>
          </div>
        </div>
      </div>
    )
  }

  // Hata durumu
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sepet Yüklenemedi</h1>
          <p className="text-muted-foreground mb-6">
            Sepetiniz yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
          </p>
          <Button onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </div>
      </div>
    )
  }

  // Boş sepet durumu
  if (!cart || CartUtils.isEmpty(cart)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Sepetiniz Boş</h1>
          <p className="text-muted-foreground mb-8">
            Henüz sepetinize ürün eklememişsiniz. 
            Alışverişe başlayın ve sepetinizi doldurun!
          </p>
          <Button size="lg" onClick={continueShopping}>
            Alışverişe Başla
          </Button>
        </div>
      </div>
    )
  }

  // Hesaplamalar
  const summary = CartUtils.getSummary(cart)
  const subtotal = summary.subtotal
  const shipping = summary.shipping
  const tax = summary.tax
  const total = summary.totalAmount

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Sayfa Başlığı */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Alışveriş Sepeti</h1>
          <p className="text-muted-foreground">
            Sepetinizde {summary.itemCount} {summary.itemCount === 1 ? 'ürün' : 'ürün'} var
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sepet Öğeleri */}
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Sepet Ürünleri</h2>
              </div>
              
              <div className="divide-y">
                {cart.items.map((item) => (
                  <CartPageItem
                    key={item.productId}
                    item={item}
                    onUpdateQuantity={(quantity) => updateQuantity(item.productId, quantity)}
                    onRemove={() => removeItem(item.productId)}
                    isUpdating={updatingItems.has(item.productId)}
                  />
                ))}
              </div>
              
              {/* Sepet İşlemleri */}
              <div className="p-6 border-t">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <Button 
                    variant="outline" 
                    onClick={clearCart}
                    disabled={clearCartMutation.isPending}
                  >
                    {clearCartMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Sepeti Temizle
                  </Button>
                  <Button variant="outline" onClick={continueShopping}>
                    Alışverişe Devam Et
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sipariş Özeti */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Sipariş Özeti</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span>{CartUtils.formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo</span>
                  <span>{shipping === 0 ? 'Ücretsiz' : CartUtils.formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>KDV (%18)</span>
                  <span>{CartUtils.formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Toplam</span>
                    <span>{CartUtils.formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {shipping > 0 && (
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Ücretsiz kargo için {CartUtils.formatPrice(500 - subtotal)} daha ekleyin!
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={goToCheckout}>
                  {isAuthenticated ? 'Ödemeye Geç' : 'Ödeme İçin Giriş Yap'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button variant="outline" className="w-full">
                  Sonra İçin Kaydet
                </Button>
              </div>

              {/* Güvenlik Rozeti */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  🔒 SSL şifreleme ile güvenli ödeme
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Sepet sayfası öğesi bileşeni
 */
interface CartPageItemProps {
  item: CartItem
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
  isUpdating?: boolean
}

const CartPageItem: React.FC<CartPageItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false
}) => {
  return (
    <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Ürün Resmi */}
      <div className="flex-shrink-0 relative">
        <img
          src={item.imageUrl || '/placeholder-product.svg'}
          alt={item.productName}
          className="w-24 h-24 object-cover rounded-lg border"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-product.svg'
          }}
        />
        {item.inStock === false && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <span className="text-xs text-white font-medium">Stokta Yok</span>
          </div>
        )}
      </div>

      {/* Ürün Bilgileri */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">
          {item.productName}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3">
          Birim fiyat: {CartUtils.formatPrice(item.price)}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">
            Toplam: {CartUtils.formatPrice(item.totalItemPrice)}
          </p>
          
          {/* Mobil: Miktar ve Kaldır */}
          <div className="flex items-center gap-3 sm:hidden">
            <div className="flex items-center border rounded">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                {item.quantity}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                disabled={isUpdating}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={isUpdating}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop: Miktar Kontrolü */}
      <div className="hidden sm:flex items-center gap-4">
        <div className="flex items-center border rounded">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating}
            className="h-9 w-9 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
            {item.quantity}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            disabled={isUpdating}
            className="h-9 w-9 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Toplam Fiyat */}
        <div className="text-right min-w-[100px]">
          <p className="font-semibold text-lg">
            {CartUtils.formatPrice(item.totalItemPrice)}
          </p>
        </div>

        {/* Kaldır Butonu */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={isUpdating}
          className="h-9 w-9 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default CartPage