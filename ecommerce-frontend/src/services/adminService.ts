/**
 * Admin Servisi
 * 
 * Superuser yetkili kullanıcılar için admin işlemleri:
 * - Ürün yönetimi
 * - Kategori/Marka yönetimi
 * - Kullanıcı yönetimi
 * - Soru-cevap yönetimi
 * - Öneri sistemi yönetimi
 */

import { apiClient } from '@/lib/axios'
import type { Product } from '@/types/product'

export interface AdminStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingQuestions: number
  lowStockProducts: number
}

export interface ProductCreateRequest {
  name: string
  description: string
  price: number
  categoryId: number
  brandId: number
  initialStockCount?: number
  specsData?: string
}

export interface ProductUpdateRequest {
  name?: string
  description?: string
  price?: number
  categoryId?: number
  brandId?: number
  stockQuantity?: number
  featured?: boolean
  active?: boolean
  specs?: Record<string, string>
}

export interface StockUpdateRequest {
  stockQuantity: number
  lowStockThreshold?: number
}

export class AdminService {
  private static instance: AdminService

  private constructor() {}

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService()
    }
    return AdminService.instance
  }

  // === DASHBOARD STATS ===

  /**
   * Admin dashboard istatistiklerini getir
   * Backend stats endpointleri çalışmıyorsa fallback değerler kullan
   */
  async getDashboardStats(): Promise<AdminStats> {
    console.log('[AdminService] Dashboard istatistikleri getiriliyor...')
    
    try {
      // Paralel olarak tüm istatistikleri çek - 500 hatası alırsa fallback kullan
      const [
        usersResponse,
        productsResponse,
        ordersResponse,
        questionsResponse
      ] = await Promise.allSettled([
        apiClient.get('/api/v1/users/stats').catch(() => ({ data: { total: 0 } })),
        apiClient.get('/api/v1/products/stats').catch(() => ({ data: { total: 0, lowStock: 0 } })),
        apiClient.get('/api/v1/orders/stats').catch(() => ({ data: { total: 0, revenue: 0 } })),
        apiClient.get('/api/v1/questions/pending?size=1')
      ])

      // Fallback değerlerle stats oluştur
      const stats: AdminStats = {
        totalUsers: usersResponse.status === 'fulfilled' ? (usersResponse.value.data?.total || 0) : 0,
        totalProducts: productsResponse.status === 'fulfilled' ? (productsResponse.value.data?.total || 0) : 0,
        totalOrders: ordersResponse.status === 'fulfilled' ? (ordersResponse.value.data?.total || 0) : 0,
        totalRevenue: ordersResponse.status === 'fulfilled' ? (ordersResponse.value.data?.revenue || 0) : 0,
        pendingQuestions: questionsResponse.status === 'fulfilled' ? (questionsResponse.value.data?.totalElements || 0) : 0,
        lowStockProducts: productsResponse.status === 'fulfilled' ? (productsResponse.value.data?.lowStock || 0) : 0
      }

      console.log('[AdminService] Dashboard istatistikleri alındı:', stats)
      return stats
    } catch (error) {
      console.error('[AdminService] Dashboard stats error:', error)
      
      // Fallback stats döndür
      return {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingQuestions: 0,
        lowStockProducts: 0
      }
    }
  }

  // === ÜRÜN YÖNETİMİ ===

  /**
   * Basit ürün oluştur (JSON)
   */
  async createProduct(request: ProductCreateRequest): Promise<Product> {
    console.log('[AdminService] Basit ürün oluşturuluyor...', request)
    
    try {
      // Backend'in beklediği format için düzenleme
      const requestData = {
        name: request.name,
        description: request.description,
        price: Number(request.price),
        categoryId: Number(request.categoryId),
        brandId: Number(request.brandId),
        initialStockCount: Number(request.initialStockCount || 0),
        specsData: request.specsData || "{}"
      }
      
      console.log('[AdminService] Backend\'e gönderilen data:', requestData)
      
      const response = await apiClient.post('/api/v1/products', requestData)
      
      console.log('[AdminService] Ürün oluşturuldu:', response.data)
      return response.data
    } catch (error: any) {
      console.error('[AdminService] Ürün oluşturma hatası:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Resimli ürün oluştur (Multipart)
   */
  async createProductWithImages(request: ProductCreateRequest, images: File[]): Promise<Product> {
    console.log('[AdminService] Resimli ürün oluşturuluyor...', request, images)
    
    try {
      const formData = new FormData()
      
      // Ürün verisi
      const productData = {
        name: request.name,
        description: request.description,
        price: Number(request.price),
        categoryId: Number(request.categoryId),
        brandId: Number(request.brandId),
        initialStockCount: Number(request.initialStockCount || 0),
        specsData: request.specsData || "{}"
      }
      
      formData.append('data', JSON.stringify(productData))
      
      // Resimler
      images.forEach((image) => {
        formData.append('images', image)
      })
      
      console.log('[AdminService] Multipart data hazırlandı')
      
      const response = await apiClient.post('/api/v1/products/with-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('[AdminService] Resimli ürün oluşturuldu:', response.data)
      return response.data
    } catch (error: any) {
      console.error('[AdminService] Resimli ürün oluşturma hatası:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Ürün güncelle (Admin)
   * Backend: PUT /api/v1/products/{id}
   */
  async updateProduct(id: string | number, request: ProductUpdateRequest): Promise<Product> {
    console.log('[AdminService] Ürün güncelleniyor:', id, request)
    const response = await apiClient.put<Product>(`/api/v1/products/${id}`, request)
    console.log('[AdminService] Ürün güncellendi:', response.data)
    return response.data
  }

  /**
   * Ürün sil (Admin)
   * Backend: DELETE /api/v1/products/{id}
   */
  async deleteProduct(id: string | number): Promise<void> {
    console.log('[AdminService] Ürün siliniyor:', id)
    await apiClient.delete(`/api/v1/products/${id}`)
    console.log('[AdminService] Ürün silindi:', id)
  }

  /**
   * Ürün öne çıkarma durumunu güncelle (Admin)
   * Backend: PATCH /api/v1/products/{id}/featured
   */
  async updateFeaturedStatus(id: string | number, featured: boolean): Promise<Product> {
    console.log('[AdminService] Ürün öne çıkarma durumu güncelleniyor:', id, featured)
    const response = await apiClient.patch<Product>(
      `/api/v1/products/${id}/featured?featured=${featured}`
    )
    console.log('[AdminService] Öne çıkarma durumu güncellendi:', response.data)
    return response.data
  }

  /**
   * Ürün stok güncelle (Admin)
   * Backend: PUT /api/v1/products/{id}/stock
   */
  async updateProductStock(id: string | number, request: StockUpdateRequest): Promise<Product> {
    console.log('[AdminService] Ürün stok güncelleniyor:', id, request)
    const response = await apiClient.put<Product>(`/api/v1/products/${id}/stock`, request)
    console.log('[AdminService] Stok güncellendi:', response.data)
    return response.data
  }

  // === ÖNERİ SİSTEMİ YÖNETİMİ ===

  /**
   * Öneri modelini manuel olarak eğit (Admin)
   * Backend: POST /api/v1/recommendations/train
   */
  async trainRecommendationModel(): Promise<string> {
    console.log('[AdminService] Öneri modeli eğitiliyor...')
    const response = await apiClient.post<string>('/api/v1/recommendations/train')
    console.log('[AdminService] Model eğitimi tamamlandı:', response.data)
    return response.data
  }

  // === KULLANICI YÖNETİMİ ===

  /**
   * Kullanıcı detayını getir (Admin)
   * Backend: GET /api/v1/users/{keycloakId}
   */
  async getUserById(keycloakId: string): Promise<any> {
    console.log('[AdminService] Kullanıcı detayı getiriliyor:', keycloakId)
    const response = await apiClient.get(`/api/v1/users/${keycloakId}`)
    console.log('[AdminService] Kullanıcı detayı alındı:', response.data)
    return response.data
  }

  // === RESİM YÖNETİMİ ===

  /**
   * Ürüne resim ekle (Admin)
   * Backend: POST /api/v1/products/{productId}/images
   */
  async addProductImage(productId: string | number, imageFile: File): Promise<any> {
    console.log('[AdminService] Ürüne resim ekleniyor:', productId)
    
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await apiClient.post(
      `/api/v1/products/${productId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    
    console.log('[AdminService] Resim eklendi:', response.data)
    return response.data
  }

  /**
   * Ürün resmini sil (Admin)
   * Backend: DELETE /api/v1/products/{productId}/images/{imageId}
   */
  async deleteProductImage(productId: string | number, imageId: string | number): Promise<void> {
    console.log('[AdminService] Ürün resmi siliniyor:', productId, imageId)
    await apiClient.delete(`/api/v1/products/${productId}/images/${imageId}`)
    console.log('[AdminService] Resim silindi:', imageId)
  }

  /**
   * Ürün resim sırasını güncelle (Admin)
   * Backend: PUT /api/v1/products/{productId}/images/order
   */
  async updateImageOrder(productId: string | number, updates: any[]): Promise<void> {
    console.log('[AdminService] Resim sırası güncelleniyor:', productId, updates)
    await apiClient.put(`/api/v1/products/${productId}/images/order`, updates)
    console.log('[AdminService] Resim sırası güncellendi')
  }
}

// Singleton instance'ı export et
export const adminService = AdminService.getInstance()