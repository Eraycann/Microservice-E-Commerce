/**
 * CartDrawer Bileşeni
 * 
 * Backend CartController API'larına uygun sepet drawer'ı:
 * - GET /api/v1/cart - Sepeti getir
 * - POST /api/v1/cart/items - Ürün ekle (miktar güncelleme için)
 * - DELETE /api/v1/cart/items/{productId} - Ürün çıkar
 * - DELETE /api/v1/cart - Sepeti temizle
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { cartService } from '@/services/cartService'
import { useCartActions, useCartUI } from '@/features/cart/cartStore'
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  Loader2,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { CartItem } from '@/types/cart'

interface CartDrawerProps {
  /** Drawer açık mı */
  isOpen?: boolean
  /** Kapanma callback'i */
  onClose?: () => void
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose
}) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isCartOpen } = useCartUI()
  const { closeCart } = useCartActions()
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())

  // Prop'lardan veya store'dan durumu al
  const isOpen = propIsOpen ?? isCartOpen
  const onClose = propOnClose ?? closeCart

  // Sepet verilerini getir
  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    enabled: isOpen, // Sadece drawer açıkken veri çek
    staleTime: 1000 * 60, // 1 dakika
    refetchOnWindowFocus: false
  })

  // Miktar güncelleme (doğru API çağrısı ile)
  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      cartService.updateCartItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error) => {
      console.error('[CartDrawer] Miktar güncelleme hatası:', error)
    },
    onSettled: (_, __, variables) => {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(variables.productId)
        return newSet
      })
    }
  })

  // Öğe kaldırma
  const removeItemMutation = useMutation({
    mutationFn: (productId: number) => cartService.removeFromCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error) => {
      console.error('[CartDrawer] Öğe kaldırma hatası:', error)
    }
  })

  // Sepeti temizleme
  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error) => {
      console.error('[CartDrawer] Sepet temizleme hatası:', error)
    }
  })

  // Miktar güncelleme
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItemMutation.mutate(productId)
      return
    }

    setUpdatingItems(prev => new Set(prev).add(productId))
    updateQuantityMutation.mutate({ productId, quantity: newQuantity })
  }

  // Öğe kaldırma
  const removeItem = (productId: number) => {
    removeItemMutation.mutate(productId)
  }

  // Sepeti temizle
  const clearCart = () => {
    if (window.confirm('Sepeti tamamen temizlemek istediğinizden emin misiniz?')) {
      clearCartMutation.mutate()
    }
  }

  // Sepete git
  const goToCart = () => {
    onClose()
    navigate('/cart')
  }

  // Ödemeye git
  const goToCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  // Yardımcı fonksiyonlar
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  const getTotalItems = () => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  const isEmpty = () => {
    return !cart || cart.items.length === 0
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Sepetim</h2>
              {getTotalItems() > 0 && (
                <p className="text-sm text-muted-foreground">
                  {getTotalItems()} ürün
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* İçerik */}
        <div className="flex flex-col h-full">
          {/* Sepet Öğeleri */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Sepet yükleniyor...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12 space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-destructive font-medium">Sepet yüklenirken hata oluştu</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['cart'] })}
                  className="mx-auto"
                >
                  Tekrar Dene
                </Button>
              </div>
            ) : isEmpty() ? (
              <div className="text-center py-12 space-y-4">
                <div className="p-6 bg-muted/50 rounded-xl">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold text-foreground mb-2">Sepetiniz boş</h3>
                  <p className="text-sm text-muted-foreground">
                    Alışverişe başlamak için ürün ekleyin
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {cart!.items.map((item) => (
                  <CartDrawerItem
                    key={item.productId}
                    item={item}
                    onUpdateQuantity={(quantity) => updateQuantity(item.productId, quantity)}
                    onRemove={() => removeItem(item.productId)}
                    isUpdating={updatingItems.has(item.productId)}
                    isRemoving={removeItemMutation.isPending}
                  />
                ))}

                {/* Sepeti Temizle */}
                {cart!.items.length > 0 && (
                  <div className="pt-4 border-t mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      disabled={clearCartMutation.isPending}
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sepeti Temizle
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart && !isEmpty() && (
            <div className="border-t bg-gradient-to-r from-primary/5 to-primary/10 p-6 space-y-4">
              {/* Toplam */}
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                <span className="text-lg font-semibold text-foreground">Toplam:</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(cart.totalCartPrice)}
                </span>
              </div>

              {/* Butonlar */}
              <div className="space-y-3">
                <Button 
                  onClick={goToCheckout} 
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg"
                  size="lg"
                >
                  Ödemeye Git
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  onClick={goToCart} 
                  variant="outline" 
                  className="w-full h-10 border-primary/20 text-primary hover:bg-primary/5"
                >
                  Sepeti Görüntüle
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * Sepet drawer öğesi bileşeni
 */
interface CartDrawerItemProps {
  item: CartItem
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
  isUpdating?: boolean
  isRemoving?: boolean
}

const CartDrawerItem: React.FC<CartDrawerItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
  isRemoving = false
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  return (
    <div className="flex gap-4 p-4 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Ürün Resmi */}
      <div className="flex-shrink-0">
        <div className="relative">
          <img
            src={item.imageUrl || '/placeholder-product.svg'}
            alt={item.productName}
            className="w-20 h-20 object-cover rounded-lg border-2 border-border"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-product.svg'
            }}
          />
          {isUpdating && (
            <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            </div>
          )}
          {item.inStock === false && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <span className="text-xs text-white font-medium">Stokta Yok</span>
            </div>
          )}
        </div>
      </div>

      {/* Ürün Bilgileri */}
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <h4 className="font-semibold text-sm line-clamp-2 text-foreground">
            {item.productName}
          </h4>
          <p className="text-xs text-muted-foreground">
            Birim fiyat: {formatPrice(item.price)}
          </p>
        </div>

        {/* Miktar ve Fiyat Kontrolü */}
        <div className="flex items-center justify-between">
          {/* Miktar Kontrolü */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating}
              className="h-8 w-8 p-0 hover:bg-background rounded-md"
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <div className="px-3 py-1 min-w-[3rem] text-center">
              <span className="text-sm font-semibold">
                {isUpdating ? '...' : item.quantity}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              disabled={isUpdating}
              className="h-8 w-8 p-0 hover:bg-background rounded-md"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Toplam Fiyat */}
          <div className="text-right">
            <p className="font-bold text-sm text-primary">
              {formatPrice(item.totalItemPrice)}
            </p>
          </div>
        </div>

        {/* Kaldır Butonu */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isRemoving}
            className="h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
          >
            {isRemoving ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Trash2 className="h-3 w-3 mr-1" />
            )}
            <span className="text-xs">Kaldır</span>
          </Button>
        </div>
      </div>
    </div>
  )
}