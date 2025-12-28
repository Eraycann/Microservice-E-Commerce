/**
 * Checkout Sayfası
 * 
 * Sepet öğelerini listeler, teslimat adresi seçimi sağlar ve sipariş oluşturur
 */

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cartService } from '@/services/cartService'
import { checkoutService } from '@/services/checkoutService'
import { userService } from '@/services/userService'
import { useAuth } from '@/features/auth/authStore'
import type { Address } from '@/types/user'
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Truck, 
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  Star
} from 'lucide-react'
import { toast } from 'sonner'

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

  // Giriş yapmamış kullanıcıları yönlendir
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Ödeme yapmak için giriş yapmanız gerekiyor')
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Sepet verilerini getir
  const { data: cart, isLoading: cartLoading, error: cartError } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated
  })

  // Kullanıcı adreslerini getir
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: () => userService.getAddresses(),
    enabled: isAuthenticated
  })

  // Varsayılan adresi seç
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find(addr => addr.defaultAddress) || addresses[0]
      setSelectedAddress(defaultAddress)
    }
  }, [addresses, selectedAddress])

  // Sipariş oluşturma
  const placeOrderMutation = useMutation({
    mutationFn: (address: Address) => checkoutService.placeOrder(address),
    onSuccess: (order) => {
      console.log('[CheckoutPage] Sipariş başarıyla oluşturuldu:', order)
      // Sepeti temizle
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Siparişiniz başarıyla oluşturuldu!')
      navigate(`/orders/${order.orderNumber}`)
    },
    onError: (error: any) => {
      console.error('[CheckoutPage] Sipariş oluşturma hatası:', error)
      console.error('[CheckoutPage] Hata detayları:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      // Hata türüne göre mesaj göster
      if (error.response?.status === 400) {
        toast.error('Sipariş bilgilerinde hata var. Lütfen kontrol edin.')
      } else if (error.response?.status === 401) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
      } else if (error.response?.status === 500) {
        const errorData = error.response?.data
        if (errorData && typeof errorData === 'object') {
          console.error('[CheckoutPage] Backend hata detayı:', errorData)
          toast.error(`Sipariş oluşturulamadı: ${errorData.message || 'Sunucu hatası'}`)
        } else {
          toast.error('Sipariş oluşturulurken sunucu hatası oluştu. Lütfen tekrar deneyin.')
        }
      } else {
        toast.error('Sipariş oluşturulurken hata oluştu. Lütfen tekrar deneyin.')
      }
    }
  })

  // Sipariş ver
  const handlePlaceOrder = () => {
    console.log('[CheckoutPage] Sipariş verme işlemi başlatılıyor...')
    console.log('[CheckoutPage] Seçili adres:', selectedAddress)
    console.log('[CheckoutPage] Sepet durumu:', cart)
    
    if (!selectedAddress) {
      toast.error('Lütfen teslimat adresi seçin')
      return
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Sepetiniz boş')
      return
    }

    // Sepetteki ürünleri kontrol et
    const hasValidItems = cart.items.some(item => item.quantity > 0)
    if (!hasValidItems) {
      toast.error('Sepetinizde geçerli ürün bulunmuyor')
      return
    }

    console.log('[CheckoutPage] Sipariş oluşturma isteği gönderiliyor...')
    placeOrderMutation.mutate(selectedAddress)
  }

  // Yardımcı fonksiyonlar
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  const isEmpty = !cart || cart.items.length === 0
  const summary = cart ? checkoutService.calculateCheckoutSummary(
    cart.items.reduce((sum, item) => sum + item.quantity, 0),
    cart.totalCartPrice
  ) : null

  if (!isAuthenticated) {
    return null // Yönlendirme yapılıyor
  }

  if (cartLoading || addressesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cartError || isEmpty) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12 space-y-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
            <h1 className="text-2xl font-bold">Sepetiniz Boş</h1>
            <p className="text-muted-foreground">
              Ödeme yapmak için önce sepetinize ürün eklemelisiniz
            </p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Alışverişe Başla
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Sepete Dön
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ödeme</h1>
            <p className="text-muted-foreground">Siparişinizi tamamlayın</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Taraf - Adres Seçimi ve Sepet Öğeleri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Teslimat Adresi */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Teslimat Adresi</h2>
              </div>

              {addresses && addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{address.title}</h3>
                            {address.defaultAddress && (
                              <div className="flex items-center gap-1 text-primary text-xs bg-primary/10 px-2 py-1 rounded">
                                <Star className="h-3 w-3 fill-current" />
                                Varsayılan
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {address.fullAddress}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.district}, {address.city} {address.zipCode}
                          </p>
                        </div>
                        {selectedAddress?.id === address.id && (
                          <div className="p-1 bg-primary rounded-full">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">Kayıtlı adresiniz bulunmuyor</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/profile')}
                  >
                    Adres Ekle
                  </Button>
                </div>
              )}
            </div>

            {/* Sepet Öğeleri */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Sipariş Özeti</h2>
                <span className="text-sm text-muted-foreground">
                  ({cart!.items.length} ürün)
                </span>
              </div>

              <div className="space-y-4">
                {cart!.items.map((item) => (
                  <div key={item.productId} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                    {/* Ürün Resmi */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.imageUrl || '/placeholder-product.svg'}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    </div>

                    {/* Ürün Bilgileri */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {item.productName}
                      </h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity} adet × {formatPrice(item.price)}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatPrice(item.totalItemPrice)}
                        </span>
                      </div>
                      {item.inStock === false && (
                        <div className="mt-1">
                          <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                            Stokta Yok
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Ödeme Özeti */}
          <div className="space-y-6">
            {/* Ödeme Özeti */}
            <div className="bg-card border rounded-lg p-6 sticky top-4">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Ödeme Özeti</h2>
              </div>

              {summary && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Alt Toplam ({summary.itemCount} ürün)</span>
                    <span>{formatPrice(summary.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Kargo
                    </span>
                    <span className={summary.shippingCost === 0 ? 'text-green-600' : ''}>
                      {summary.shippingCost === 0 ? 'Ücretsiz' : formatPrice(summary.shippingCost)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>KDV (%18)</span>
                    <span>{formatPrice(summary.tax)}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Toplam</span>
                      <span className="text-primary">{formatPrice(summary.total)}</span>
                    </div>
                  </div>

                  {summary.subtotal < 500 && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                      500 TL ve üzeri alışverişlerde kargo ücretsiz!
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={!selectedAddress || placeOrderMutation.isPending}
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                    >
                      {placeOrderMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sipariş Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          Siparişi Tamamla
                          <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                        </>
                      )}
                    </Button>

                    {!selectedAddress && (
                      <p className="text-xs text-destructive text-center mt-2">
                        Lütfen teslimat adresi seçin
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage