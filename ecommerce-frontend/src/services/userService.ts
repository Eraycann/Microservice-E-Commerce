/**
 * Kullanıcı Servisi
 * 
 * Backend UserController API'larına uygun kullanıcı profili, adres yönetimi 
 * ve sipariş geçmişi işlemleri
 */

import { apiClient } from '@/lib/axios'
import type { 
  User, 
  Address, 
  Order, 
  UpdateUserProfileRequest,
  CreateAddressRequest,
  PaginatedResponse,
  NotificationSettings
} from '@/types/user'

export class UserService {
  private static instance: UserService
  private readonly baseUrl = '/api/v1/users'
  private readonly ordersUrl = '/api/v1/orders'

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

  // ===== Kullanıcı Profili İşlemleri =====

  /**
   * Mevcut kullanıcı profilini getir
   * Backend: GET /api/v1/users/me
   */
  async getUserProfile(): Promise<User> {
    const response = await apiClient.get<User>(`${this.baseUrl}/me`)
    return response.data
  }

  /**
   * Kullanıcı profilini güncelle
   * Backend: PUT /api/v1/users/me
   */
  async updateUserProfile(data: UpdateUserProfileRequest): Promise<User> {
    const response = await apiClient.put<User>(`${this.baseUrl}/me`, data)
    return response.data
  }

  /**
   * Hesabı sil
   * Backend: DELETE /api/v1/users/me
   */
  async deleteAccount(): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/me`)
  }

  /**
   * Bildirim ayarlarını güncelle
   * Backend: PATCH /api/v1/users/me/notifications
   */
  async updateNotificationSettings(settings: NotificationSettings): Promise<User> {
    const response = await apiClient.patch<User>(`${this.baseUrl}/me/notifications`, settings)
    return response.data
  }

  // ===== Adres Yönetimi İşlemleri =====

  /**
   * Kullanıcının tüm adreslerini getir
   * Backend: GET /api/v1/users/addresses
   */
  async getAddresses(): Promise<Address[]> {
    console.log('[UserService] Kullanıcı adresleri getiriliyor...')
    const response = await apiClient.get<Address[]>(`${this.baseUrl}/addresses`)
    console.log('[UserService] Adres yanıtı:', response.data)
    return response.data
  }

  /**
   * Yeni adres oluştur
   * Backend: POST /api/v1/users/addresses
   */
  async createAddress(data: CreateAddressRequest): Promise<User> {
    console.log('[UserService] Yeni adres oluşturuluyor...', data)
    const response = await apiClient.post<User>(`${this.baseUrl}/addresses`, data)
    console.log('[UserService] Adres oluşturma yanıtı:', response.data)
    return response.data
  }

  /**
   * Varsayılan adresi ayarla
   * Backend: PATCH /api/v1/users/addresses/{addressId}/default
   */
  async setDefaultAddress(addressId: string): Promise<User> {
    const response = await apiClient.patch<User>(`${this.baseUrl}/addresses/${addressId}/default`)
    return response.data
  }

  // ===== Favoriler İşlemleri =====

  /**
   * Favori ürünleri getir
   * Backend: GET /api/v1/users/favorites
   */
  async getFavorites(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.baseUrl}/favorites`)
    return response.data
  }

  /**
   * Ürünü favorilere ekle
   * Backend: POST /api/v1/users/favorites/{productId}
   */
  async addFavorite(productId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/favorites/${productId}`)
  }

  /**
   * Ürünü favorilerden çıkar
   * Backend: DELETE /api/v1/users/favorites/{productId}
   */
  async removeFavorite(productId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/favorites/${productId}`)
  }

  // ===== Geçmiş İşlemleri =====

  /**
   * Ürün geçmişine ekle
   * Backend: POST /api/v1/users/history/{productId}
   */
  async addToHistory(productId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/history/${productId}`)
  }

  /**
   * Kullanıcı geçmişini getir
   * Backend: GET /api/v1/users/history
   */
  async getHistory(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.baseUrl}/history`)
    return response.data
  }

  /**
   * Geçmişi temizle
   * Backend: DELETE /api/v1/users/history
   */
  async clearHistory(): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/history`)
  }

  // ===== Sipariş Geçmişi İşlemleri =====

  /**
   * Kullanıcının sipariş geçmişini getir
   * Backend: GET /api/v1/orders?page=0&size=10
   */
  async getOrders(
    page: number = 0, 
    size: number = 10
  ): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    })

    const response = await apiClient.get<PaginatedResponse<Order>>(
      `${this.ordersUrl}?${params.toString()}`
    )
    return response.data
  }

  // ===== EKSIK ENDPOINT'LER (Backend'de yok) =====
  // Bu metodlar UI'da gösterilecek ama çalışmayacak

  /**
   * ⚠️ EKSIK: Adresi güncelle (Backend'de endpoint yok)
   * Gerekli: PUT /api/v1/users/addresses/{addressId}
   */
  async updateAddress(_addressId: string, _data: CreateAddressRequest): Promise<User> {
    throw new Error('Bu özellik henüz Backend\'de mevcut değil. Adres güncellemesi için Backend geliştirmesi gerekli.')
  }

  /**
   * ⚠️ EKSIK: Adresi sil (Backend'de endpoint yok)
   * Gerekli: DELETE /api/v1/users/addresses/{addressId}
   */
  async deleteAddress(_addressId: string): Promise<void> {
    throw new Error('Bu özellik henüz Backend\'de mevcut değil. Adres silme için Backend geliştirmesi gerekli.')
  }

  /**
   * ⚠️ EKSIK: Sipariş detayı getir (Backend'de endpoint yok)
   * Gerekli: GET /api/v1/orders/{orderNumber}
   */
  async getOrder(_orderNumber: string): Promise<Order> {
    throw new Error('Bu özellik henüz Backend\'de mevcut değil. Sipariş detayı için Backend geliştirmesi gerekli.')
  }
}

// Singleton instance'ı export et
export const userService = UserService.getInstance()

/**
 * Kullanıcı yardımcı fonksiyonları
 */
export const UserUtils = {
  /**
   * Kullanıcının tam adını getir
   */
  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim()
  },

  /**
   * Kullanıcının baş harflerini getir
   */
  getInitials(user: User): string {
    const firstInitial = user.firstName.charAt(0).toUpperCase()
    const lastInitial = user.lastName.charAt(0).toUpperCase()
    return `${firstInitial}${lastInitial}`
  },

  /**
   * Adres formatla
   */
  formatAddress(address: Address): string {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean)
    
    return parts.join(', ')
  },

  /**
   * Adres özeti getir (kısa format)
   */
  getAddressSummary(address: Address): string {
    return `${address.title} - ${address.city}, ${address.state}`
  },

  /**
   * Sipariş durumu rengini getir
   */
  getOrderStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'PENDING': 'text-yellow-600',
      'CONFIRMED': 'text-blue-600',
      'PROCESSING': 'text-purple-600',
      'SHIPPED': 'text-indigo-600',
      'DELIVERED': 'text-green-600',
      'CANCELLED': 'text-red-600',
      'REFUNDED': 'text-orange-600',
      'RETURNED': 'text-gray-600'
    }
    return colors[status] || 'text-gray-600'
  },

  /**
   * Sipariş durumu Türkçe çevirisi
   */
  getOrderStatusText(status: string): string {
    const translations: Record<string, string> = {
      'PENDING': 'Beklemede',
      'CONFIRMED': 'Onaylandı',
      'PROCESSING': 'Hazırlanıyor',
      'SHIPPED': 'Kargoda',
      'DELIVERED': 'Teslim Edildi',
      'CANCELLED': 'İptal Edildi',
      'REFUNDED': 'İade Edildi',
      'RETURNED': 'İade Alındı'
    }
    return translations[status] || status
  },

  /**
   * Fiyat formatla
   */
  formatPrice(amount: number, currency: string = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency
    }).format(amount)
  },

  /**
   * Tarih formatla
   */
  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString))
  },

  /**
   * Kısa tarih formatla
   */
  formatShortDate(dateString: string): string {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(dateString))
  }
}