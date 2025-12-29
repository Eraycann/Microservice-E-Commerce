import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { UserProfileForm } from '@/components/user/UserProfileForm'
import AddressManager from '@/components/user/AddressManagerComponent'
import { userService } from '@/services/userService'
import { orderService } from '@/services/orderService' // 🔥 OrderService eklendi
import { OrderUtils } from '@/services/orderService' // 🔥 Yardımcı utils
import { Button } from '@/components/ui/button'
import { 
  User, 
  MapPin, 
  Package, 
  Settings, 
  CreditCard,
  Loader2,
  AlertCircle,
  Edit,
  ChevronRight
} from 'lucide-react'

/**
 * ProfilePage Component
 * * Backend UserController API'larına uygun kullanıcı profil sayfası
 */
export const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'settings'>('profile')
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // Kullanıcı profilini getir
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userService.getUserProfile(),
    enabled: !!authUser,
    initialData: authUser
  })

  // 🔥 Sipariş geçmişini OrderService üzerinden getir
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['user', 'orders'],
    queryFn: () => orderService.getUserOrders(0, 5), // İlk 5 sipariş
    enabled: !!authUser
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span className="text-lg">Profil yükleniyor...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Profil Yüklenemedi</h1>
          <p className="text-muted-foreground mb-6">
            Profiliniz yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
          </p>
          <Button onClick={() => window.location.reload()}>
            Tekrar Dene
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hesabım</h1>
          <p className="text-muted-foreground">
            Profil bilgilerinizi, adreslerinizi ve siparişlerinizi yönetin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar: Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-4 sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Profil Bilgileri
                </button>
                
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'addresses' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  Adreslerim
                </button>
                
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'orders' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  Siparişlerim
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Ayarlar
                </button>
              </nav>
            </div>
          </div>

          {/* Right Content: Tab Content */}
          <div className="lg:col-span-3">
            {/* Profil Bilgileri Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {isEditingProfile ? (
                  <UserProfileForm
                    user={user}
                    onSuccess={() => setIsEditingProfile(false)}
                  />
                ) : (
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Kişisel Bilgiler</h2>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingProfile(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Ad</label>
                        <p className="text-lg mt-1 font-medium">{user.firstName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Soyad</label>
                        <p className="text-lg mt-1 font-medium">{user.lastName}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">E-posta</label>
                        <p className="text-lg mt-1">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                        <p className="text-lg mt-1">{user.phoneNumber || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Vergi No</label>
                        <p className="text-lg mt-1">{user.taxNumber || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Adresler Tab */}
            {activeTab === 'addresses' && (
              <AddressManager user={user} />
            )}

            {/* Siparişler Tab */}
            {activeTab === 'orders' && (
              <OrderHistory 
                ordersData={ordersData}
                isLoading={ordersLoading}
              />
            )}

            {/* Ayarlar Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Bildirim Ayarları */}
                <div className="bg-card border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Settings className="w-5 h-5 mr-2 text-primary" />
                    <h2 className="text-xl font-semibold">Bildirim Ayarları</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">E-posta Bildirimleri</p>
                        <p className="text-sm text-muted-foreground">
                          Siparişler ve promosyonlar hakkında güncellemeler alın
                        </p>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        Etkin
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Bildirimleri</p>
                        <p className="text-sm text-muted-foreground">
                          SMS ile sipariş güncellemeleri alın
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        Devre Dışı
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="mt-4" disabled>
                    Ayarları Güncelle (Yakında)
                  </Button>
                </div>

                {/* Hesap Güvenliği */}
                <div className="bg-card border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CreditCard className="w-5 h-5 mr-2 text-primary" />
                    <h2 className="text-xl font-semibold">Hesap Güvenliği</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Şifre</p>
                        <p className="text-sm text-muted-foreground">
                          Son güncelleme: Bilinmiyor
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Şifre Değiştir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * OrderHistory Bileşeni
 */
interface OrderHistoryProps {
  ordersData: any
  isLoading: boolean
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ ordersData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Siparişler yükleniyor...</span>
        </div>
      </div>
    )
  }

  // 🔥 GÜVENLİ VERİ ÇEKME: Pagination yapısını (.content) kontrol et
  // Eğer ordersData.content varsa onu al, yoksa ordersData bir diziyse onu al, hiçbiri değilse boş dizi
  const orders = ordersData?.content || (Array.isArray(ordersData) ? ordersData : [])

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Sipariş Geçmişi</h2>
        </div>
        {orders.length > 0 && (
          <Button variant="outline" size="sm">
            Tüm Siparişleri Görüntüle
          </Button>
        )}
      </div>
      
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id || order.orderNumber} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{OrderUtils.formatOrderNumber(order.orderNumber)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${OrderUtils.getOrderStatusColor(order.status)}`}>
                      {OrderUtils.translateOrderStatus(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {OrderUtils.formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-primary">
                    {OrderUtils.formatPrice(order.totalPrice)}
                  </p>
                  {/* 👇 DÜZELTME BURADA YAPILDI 👇 */}
                  <p className="text-xs text-muted-foreground">
                    {/* Önce itemCount'a bak, yoksa listeyi say, o da yoksa 1 göster */}
                    {order.itemCount || order.orderItems?.length || 1} ürün
                  </p>
                </div>
              </div>

              {/* Sipariş Detay Butonu */}
              <div className="pt-3 border-t flex justify-end">
                 <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                   Detayları Gör <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground mb-2 font-medium">Henüz siparişiniz bulunmuyor</p>
          <p className="text-sm text-muted-foreground mb-6">
            İlk siparişinizi vermek için ürünlerimize göz atın
          </p>
          <Button onClick={() => window.location.href = '/products'}>
            Alışverişe Başla
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProfilePage