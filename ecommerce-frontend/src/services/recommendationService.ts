/**
 * Recommendation Service
 * 
 * Backend RecommendationService API'larına uygun öneri servisi
 * AI Engine entegrasyonu ve fallback mekanizması ile
 */

import { apiClient } from '@/lib/axios'
import type { 
  RecommendedProduct,
  UserInteractionEvent,
  TrainingResponse,
  RecommendationError,
  InteractionEventType
} from '@/types/recommendation'

export class RecommendationService {
  private static instance: RecommendationService
  private readonly baseUrl = '/api/v1/recommendations'
  
  // Konfigürasyon
  private readonly config = {
    maxRetries: 2,
    retryDelay: 1000,
    fallbackToPopular: true,
    trackInteractions: true
  }

  private constructor() {}

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService()
    }
    return RecommendationService.instance
  }

  // ===== Ana Öneri API'si =====

  /**
   * Kişiselleştirilmiş öneriler getir
   * Backend: GET /api/v1/recommendations
   * 
   * @param userId - Keycloak kullanıcı ID'si (opsiyonel)
   * @param guestId - Misafir kullanıcı ID'si (opsiyonel)
   * @returns Önerilen ürünler listesi
   */
  async getRecommendations(
    guestId?: string
  ): Promise<RecommendedProduct[]> {
    try {
      const headers: Record<string, string> = {}
      
      // GuestId varsa header'a ekle
      if (guestId) {
        headers['X-Guest-Id'] = guestId
      }

      const response = await apiClient.get<RecommendedProduct[]>(
        this.baseUrl,
        { headers }
      )

      return response.data || []
    } catch (error: any) {
      console.error('[RecommendationService] Öneri getirme hatası:', error)
      
      // Hata durumunda fallback mekanizması
      if (this.config.fallbackToPopular) {
        return this.getFallbackRecommendations()
      }
      
      throw this.createRecommendationError(error)
    }
  }

  /**
   * Belirli bir ürün için benzer ürünler getir
   * Not: Backend'de özel endpoint yok, genel öneri API'sini kullanıyoruz
   */
  async getSimilarProducts(
    currentProductId: string,
    userId?: string,
    guestId?: string
  ): Promise<RecommendedProduct[]> {
    try {
      // Önce kullanıcı etkileşimini kaydet (VIEW)
      if (this.config.trackInteractions) {
        await this.trackInteraction(currentProductId, 'VIEW', userId, guestId)
      }

      // Kimlik doğrulanmış kullanıcılar için de guestId kullan (fallback olarak)
      const effectiveGuestId = guestId || (!userId ? RecommendationUtils.getOrCreateGuestId() : undefined)

      // Genel önerileri getir
      const recommendations = await this.getRecommendations(effectiveGuestId)
      
      // Mevcut ürünü filtrele
      const filteredRecommendations = recommendations.filter(product => product.id !== currentProductId)
      
      // Eğer öneri yoksa fallback kullan
      if (filteredRecommendations.length === 0) {
        console.log('[RecommendationService] Öneri bulunamadı, fallback kullanılıyor')
        const fallbackRecommendations = await this.getFallbackRecommendations()
        return fallbackRecommendations.filter(product => product.id !== currentProductId)
      }
      
      return filteredRecommendations
    } catch (error) {
      console.error('[RecommendationService] Benzer ürün hatası:', error)
      
      // Hata durumunda fallback kullan
      try {
        const fallbackRecommendations = await this.getFallbackRecommendations()
        return fallbackRecommendations.filter(product => product.id !== currentProductId)
      } catch (fallbackError) {
        console.error('[RecommendationService] Fallback hatası:', fallbackError)
        return []
      }
    }
  }

  // ===== Kullanıcı Etkileşim Takibi =====

  /**
   * Kullanıcı etkileşimini kaydet
   * Not: Backend'de direkt endpoint yok, event sistemi kullanılıyor
   * Bu method frontend'de etkileşimleri takip etmek için kullanılır
   */
  async trackInteraction(
    productId: string,
    eventType: InteractionEventType,
    userId?: string,
    guestId?: string
  ): Promise<void> {
    if (!this.config.trackInteractions) return

    try {
      const event: UserInteractionEvent = {
        userId,
        guestId,
        productId,
        eventType,
        timestamp: Date.now()
      }

      // Bu bilgiyi localStorage'da sakla veya analytics servisine gönder
      // Backend event sistemi RabbitMQ üzerinden çalışıyor
      this.storeInteractionLocally(event)
      
      console.log('[RecommendationService] Etkileşim kaydedildi:', event)
    } catch (error) {
      console.error('[RecommendationService] Etkileşim kaydetme hatası:', error)
      // Etkileşim hatası kritik değil, sessizce devam et
    }
  }

  /**
   * Ürün görüntüleme etkileşimi
   */
  async trackProductView(productId: string, userId?: string, guestId?: string): Promise<void> {
    return this.trackInteraction(productId, 'VIEW', userId, guestId)
  }

  /**
   * Sepete ekleme etkileşimi
   */
  async trackAddToCart(productId: string, userId?: string, guestId?: string): Promise<void> {
    return this.trackInteraction(productId, 'ADD_TO_CART', userId, guestId)
  }

  /**
   * Satın alma etkileşimi
   */
  async trackPurchase(productId: string, userId?: string, guestId?: string): Promise<void> {
    return this.trackInteraction(productId, 'PURCHASE', userId, guestId)
  }

  // ===== Admin İşlemleri =====

  /**
   * Manuel model eğitimi tetikle (Admin only)
   * Backend: POST /api/v1/recommendations/train
   */
  async triggerTraining(): Promise<TrainingResponse> {
    try {
      const response = await apiClient.post<TrainingResponse>(`${this.baseUrl}/train`)
      return response.data
    } catch (error: any) {
      console.error('[RecommendationService] Model eğitim hatası:', error)
      throw this.createRecommendationError(error)
    }
  }

  // ===== Fallback ve Yardımcı Metodlar =====

  /**
   * Fallback önerileri getir (popüler ürünler)
   * SearchService'den bestseller'ları çek
   */
  private async getFallbackRecommendations(): Promise<RecommendedProduct[]> {
    try {
      // SearchService'den popüler ürünleri getir
      const { searchService } = await import('@/services/searchService')
      const searchResult = await searchService.searchProducts({
        sort: 'popularity,desc',
        page: 0,
        size: 10
      })

      // SearchResult'ı RecommendedProduct formatına çevir
      return searchResult.products.map(product => ({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || product.imageUrls?.[0] || ''
      }))
    } catch (error) {
      console.error('[RecommendationService] Fallback hatası:', error)
      return []
    }
  }

  /**
   * Etkileşimi localStorage'da sakla
   */
  private storeInteractionLocally(event: UserInteractionEvent): void {
    try {
      const key = 'user_interactions'
      const stored = localStorage.getItem(key)
      const interactions = stored ? JSON.parse(stored) : []
      
      interactions.push(event)
      
      // Son 100 etkileşimi sakla
      if (interactions.length > 100) {
        interactions.splice(0, interactions.length - 100)
      }
      
      localStorage.setItem(key, JSON.stringify(interactions))
    } catch (error) {
      console.error('[RecommendationService] localStorage hatası:', error)
    }
  }

  /**
   * Hata objesi oluştur
   */
  private createRecommendationError(error: any): RecommendationError {
    if (error.response?.status === 503) {
      return {
        code: 'AI_ENGINE_DOWN',
        message: 'AI öneri servisi şu anda kullanılamıyor',
        fallbackUsed: this.config.fallbackToPopular
      }
    }
    
    if (error.response?.status === 404) {
      return {
        code: 'NO_RECOMMENDATIONS',
        message: 'Bu kullanıcı için öneri bulunamadı',
        fallbackUsed: this.config.fallbackToPopular
      }
    }
    
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Ağ bağlantısı hatası',
        fallbackUsed: this.config.fallbackToPopular
      }
    }
    
    return {
      code: 'UNKNOWN',
      message: error.message || 'Bilinmeyen hata',
      fallbackUsed: this.config.fallbackToPopular
    }
  }

  // ===== Konfigürasyon =====

  /**
   * Servis konfigürasyonunu güncelle
   */
  updateConfig(newConfig: Partial<typeof this.config>): void {
    Object.assign(this.config, newConfig)
  }

  /**
   * Mevcut konfigürasyonu getir
   */
  getConfig() {
    return { ...this.config }
  }
}

// Singleton instance'ı export et
export const recommendationService = RecommendationService.getInstance()

/**
 * Recommendation yardımcı fonksiyonları
 */
export const RecommendationUtils = {
  /**
   * Guest ID oluştur veya mevcut olanı getir
   */
  getOrCreateGuestId(): string {
    const key = 'guest_id'
    let guestId = localStorage.getItem(key)
    
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
      localStorage.setItem(key, guestId)
    }
    
    return guestId
  },

  /**
   * Guest ID'yi temizle (login sonrası)
   */
  clearGuestId(): void {
    localStorage.removeItem('guest_id')
  },

  /**
   * Etkileşim geçmişini temizle
   */
  clearInteractionHistory(): void {
    localStorage.removeItem('user_interactions')
  },

  /**
   * Saklanan etkileşimleri getir
   */
  getStoredInteractions(): UserInteractionEvent[] {
    try {
      const stored = localStorage.getItem('user_interactions')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  /**
   * Ürün fiyatını formatla
   */
  formatPrice(price: number, currency: string = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency
    }).format(price)
  }
}