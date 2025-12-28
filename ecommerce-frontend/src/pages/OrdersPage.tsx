/**
 * OrdersPage Component
 * 
 * Kullanıcının siparişlerini listeleyen sayfa
 * OrderService entegrasyonu ile backend'den siparişleri getirir
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth'
import { orderService, OrderUtils } from '@/services/orderService'
import type { OrderResponse } from '@/types/order'
import { 
  Package, 
  Calendar,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Eye,
  RefreshCw,
  Filter
} from 'lucide-react'

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Siparişleri getir
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['user-orders', currentPage],
    queryFn: () => orderService.getUserOrders(currentPage, 10),
    enabled: !!user,
    retry: 2
  })

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Giriş Gerekli</h1>
          <p className="text-muted-foreground mb-6">
            Siparişlerinizi görüntülemek için giriş yapmalısınız.
          </p>
          <Button onClick={() => navigate('/login')}>
            Giriş Yap
          </Button>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Siparişleriniz yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Hata Oluştu</h1>
            <p className="text-muted-foreground mb-6">
              {error instanceof Error ? error.message : 'Siparişler yüklenirken bir hata oluştu.'}
            </p>
            <Button onClick={() => refetch()} disabled={isRefetching}>
              {isRefetching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yeniden Yükleniyor...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tekrar Dene
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const orders = ordersData?.content || []
  const totalOrders = ordersData?.totalElements || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Siparişlerim</h1>
            <p className="text-muted-foreground">
              Toplam {totalOrders} sipariş
            </p>
          </div>
          
          <Button
            onClick={() => refetch()}
            variant="outline"
            disabled={isRefetching}
          >
            {isRefetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">Tüm Siparişler</option>
              <option value="PENDING">Beklemede</option>
              <option value="CONFIRMED">Onaylandı</option>
              <option value="PROCESSING">Hazırlanıyor</option>
              <option value="SHIPPED">Kargoya Verildi</option>
              <option value="DELIVERED">Teslim Edildi</option>
              <option value="CANCELLED">İptal Edildi</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: OrderResponse) => (
              <OrderCard
                key={order.orderNumber}
                order={order}
                onClick={() => navigate(`/orders/${order.orderNumber}`)}
              />
            ))}

            {/* Pagination */}
            {ordersData && ordersData.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  Önceki
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Sayfa {currentPage + 1} / {ordersData.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= ordersData.totalPages - 1}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Henüz Siparişiniz Yok</h2>
            <p className="text-muted-foreground mb-6">
              İlk siparişinizi vermek için alışverişe başlayın.
            </p>
            <Button onClick={() => navigate('/')}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Alışverişe Başla
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Order Card Component
interface OrderCardProps {
  order: OrderResponse
  onClick: () => void
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const statusInfo = OrderUtils.getOrderStatusColor(order.status)
  
  return (
    <div 
      onClick={onClick}
      className="bg-card border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Package className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold">
              {OrderUtils.formatOrderNumber(order.orderNumber)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {order.itemCount} ürün
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-semibold">
            {OrderUtils.formatPrice(order.totalPrice)}
          </p>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${statusInfo}`}>
            {OrderUtils.translateOrderStatus(order.status)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{OrderUtils.formatOrderDate(order.createdAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-primary">
          <Eye className="w-4 h-4" />
          <span>Detayları Gör</span>
        </div>
      </div>
    </div>
  )
}

export default OrdersPage