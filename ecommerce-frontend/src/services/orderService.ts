/**
 * Order Service
 * 
 * Backend OrderService API'larına uygun sipariş servisi
 * OrderController entegrasyonu
 */

import { apiClient } from '@/lib/axios'
import type { 
  CreateOrderRequest,
  OrderResponse,
  PaginatedResponse
} from '@/types/order'

export class OrderService {
  private static instance: OrderService
  private readonly baseUrl = '/api/v1/orders'

  private constructor() {}

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService()
    }
    return OrderService.instance
  }

  // ===== ORDER API'leri =====

  /**
   * Sipariş ver
   * Backend: POST /api/v1/orders
   */
  async placeOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    try {
      const response = await apiClient.post<OrderResponse>(
        this.baseUrl,
        orderData
      )

      return response.data
    } catch (error: any) {
      console.error('[OrderService] Sipariş verme hatası:', error)
      throw this.createOrderError(error, 'Sipariş verilirken bir hata oluştu')
    }
  }

  /**
   * Kullanıcı siparişlerini getir (sayfalı)
   * Backend: GET /api/v1/orders
   */
  async getUserOrders(
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<OrderResponse>> {
    try {
      const response = await apiClient.get<PaginatedResponse<OrderResponse>>(
        this.baseUrl,
        {
          params: { page, size }
        }
      )

      return response.data
    } catch (error: any) {
      console.error('[OrderService] Siparişleri getirme hatası:', error)
      throw this.createOrderError(error, 'Siparişler yüklenirken bir hata oluştu')
    }
  }

  // ===== Yardımcı Metodlar =====

  /**
   * Hata objesi oluştur
   */
  private createOrderError(error: any, defaultMessage: string): Error {
    if (error.response?.status === 400) {
      return new Error(error.response.data?.message || 'Geçersiz sipariş verisi')
    }
    
    if (error.response?.status === 402) {
      return new Error('Ödeme işlemi başarısız')
    }
    
    if (error.response?.status === 409) {
      return new Error('Stok yetersiz veya ürün mevcut değil')
    }
    
    if (error.response?.status === 404) {
      return new Error('Sipariş bulunamadı')
    }
    
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return new Error('Ağ bağlantısı hatası')
    }
    
    return new Error(error.response?.data?.message || defaultMessage)
  }
}

// Singleton instance'ı export et
export const orderService = OrderService.getInstance()

/**
 * Order yardımcı fonksiyonları
 */
export const OrderUtils = {
  /**
   * Sipariş durumunu Türkçe'ye çevir
   */
  translateOrderStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'Beklemede',
      'CONFIRMED': 'Onaylandı',
      'PROCESSING': 'Hazırlanıyor',
      'SHIPPED': 'Kargoya Verildi',
      'DELIVERED': 'Teslim Edildi',
      'CANCELLED': 'İptal Edildi',
      'REFUNDED': 'İade Edildi'
    }
    
    return statusMap[status] || status
  },

  /**
   * Sipariş durumu rengini getir
   */
  getOrderStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'PENDING': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'CONFIRMED': 'text-blue-600 bg-blue-50 border-blue-200',
      'PROCESSING': 'text-purple-600 bg-purple-50 border-purple-200',
      'SHIPPED': 'text-orange-600 bg-orange-50 border-orange-200',
      'DELIVERED': 'text-green-600 bg-green-50 border-green-200',
      'CANCELLED': 'text-red-600 bg-red-50 border-red-200',
      'REFUNDED': 'text-gray-600 bg-gray-50 border-gray-200'
    }
    
    return colorMap[status] || 'text-gray-600 bg-gray-50 border-gray-200'
  },

  /**
   * Fiyatı formatla
   */
  formatPrice(price: number, currency: string = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency
    }).format(price)
  },

  /**
   * Tarihi formatla
   */
  formatOrderDate(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  },

  /**
   * Sipariş numarasını formatla
   */
  formatOrderNumber(orderNumber: string): string {
    // Örnek: ORD-2024-001234 -> #ORD-001234
    if (orderNumber.includes('-')) {
      const parts = orderNumber.split('-')
      return `#${parts[0]}-${parts[parts.length - 1]}`
    }
    return `#${orderNumber}`
  },

  /**
   * Teslimat adresini doğrula
   */
  validateShippingAddress(address: string): { valid: boolean; error?: string } {
    if (!address || address.trim().length === 0) {
      return { valid: false, error: 'Teslimat adresi gereklidir' }
    }
    
    if (address.trim().length < 10) {
      return { valid: false, error: 'Teslimat adresi çok kısa' }
    }
    
    if (address.trim().length > 500) {
      return { valid: false, error: 'Teslimat adresi çok uzun' }
    }
    
    return { valid: true }
  },

  /**
   * Sipariş özetini oluştur
   */
  createOrderSummary(order: OrderResponse): string {
    const status = this.translateOrderStatus(order.status)
    const date = this.formatOrderDate(order.createdAt)
    const price = this.formatPrice(order.totalPrice)
    
    return `${this.formatOrderNumber(order.orderNumber)} - ${status} - ${price} - ${date}`
  }
}