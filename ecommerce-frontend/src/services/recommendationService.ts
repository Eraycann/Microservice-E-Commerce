/**
 * Recommendation Service
 * Backend compatible service feeding ProductCard components.
 */

import { apiClient } from '@/lib/axios'

// --- TYPES ---
export type InteractionEventType = 'VIEW' | 'ADD_TO_CART' | 'PURCHASE'

export interface RecommendedProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  // Image variations
  image: string
  imageUrl: string
  images: string[]
  imageUrls: string[]
  // String fields
  slug: string
  brand: string
  category: string
  active: boolean
  inStock: boolean
  stockQuantity: number 
  rating: number
  reviewCount: number
}

// --- HELPER METHODS (EXPORTED) ---
export const RecommendationUtils = {
  getOrCreateGuestId(): string {
    const key = 'guest_id'
    let guestId = localStorage.getItem(key)
    if (!guestId) {
      guestId = 'guest_' + Date.now() + Math.random().toString(36).substr(2, 5)
      localStorage.setItem(key, guestId)
    }
    return guestId
  },

  storeInteractionLocally(event: any): void {
    try {
      const key = 'user_interactions_queue'
      const stored = localStorage.getItem(key)
      const list = stored ? JSON.parse(stored) : []
      list.push(event)
      if (list.length > 50) list.shift()
      localStorage.setItem(key, JSON.stringify(list))
    } catch(e) {
      console.warn('LocalStorage interaction save failed')
    }
  }
}

// --- SERVICE CLASS ---
export class RecommendationService {
  private static instance: RecommendationService
  private readonly baseUrl = '/api/v1/recommendations'
  
  private readonly config = {
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

  // ===== Main Recommendation API =====

  async getRecommendations(guestId?: string): Promise<RecommendedProduct[]> {
    try {
      const headers: Record<string, string> = {}
      const effectiveGuestId = guestId || RecommendationUtils.getOrCreateGuestId()
      headers['X-Guest-Id'] = effectiveGuestId

      const response = await apiClient.get<any[]>(this.baseUrl, { 
        headers,
        validateStatus: (status) => status >= 200 && status < 300
      })

      if (!response.data || response.data.length === 0) {
        return this.getFallbackRecommendations()
      }

      return response.data.map(this.convertToProductModel)

    } catch (error) {
      console.error('[Recommendation] Error:', error)
      if (this.config.fallbackToPopular) return this.getFallbackRecommendations()
      return [] 
    }
  }

  // 👇 ADDED: Manual Training Trigger for Admin Panel
  async trainModel(): Promise<string> {
    try {
      const response = await apiClient.post<string>(`${this.baseUrl}/train`)
      return response.data
    } catch (error) {
      console.error('[Recommendation] Training failed:', error)
      throw error
    }
  }

  async getSimilarProducts(currentProductId: string, userId?: string, guestId?: string): Promise<RecommendedProduct[]> {
    try {
      if (this.config.trackInteractions) {
        this.trackProductView(currentProductId, userId, guestId)
      }
      const recommendations = await this.getRecommendations(guestId)
      return recommendations.filter(p => p.id !== currentProductId)
    } catch (error) {
      return []
    }
  }

  // ===== Interaction Methods =====

  async trackProductView(productId: string, userId?: string, guestId?: string) {
    this.sendInteraction(productId, 'VIEW', userId, guestId)
  }

  async trackAddToCart(productId: string, userId?: string, guestId?: string) {
    this.sendInteraction(productId, 'ADD_TO_CART', userId, guestId)
  }

  async trackPurchase(productId: string, userId?: string, guestId?: string) {
    this.sendInteraction(productId, 'PURCHASE', userId, guestId)
  }

  private sendInteraction(productId: string, eventType: InteractionEventType, userId?: string, guestId?: string) {
    if (!this.config.trackInteractions) return
    const event = {
      userId,
      guestId: guestId || RecommendationUtils.getOrCreateGuestId(),
      productId,
      eventType,
      timestamp: Date.now()
    }
    RecommendationUtils.storeInteractionLocally(event)
  }

  // ===== Conversion Methods =====

  private convertToProductModel(dto: any): RecommendedProduct {
    const img = dto.imageUrl || dto.image || ''
    
    return {
      id: dto.id?.toString() || '',
      name: dto.name || 'Unnamed Product',
      description: dto.description || '',
      price: dto.price || 0,
      currency: 'TRY',
      
      image: img,
      imageUrl: img,
      images: img ? [img] : [],
      imageUrls: img ? [img] : [],

      slug: dto.slug || '',
      brand: dto.brand || 'General',
      category: dto.category || 'General',

      active: true,
      inStock: true,
      stockQuantity: 100, 
      
      rating: dto.rating || 0,
      reviewCount: dto.reviewCount || 0
    }
  }

  private async getFallbackRecommendations(): Promise<RecommendedProduct[]> {
    try {
      const { searchService } = await import('@/services/searchService')
      let products = await searchService.getBestSellers()
      if (!products || products.length === 0) {
        products = await searchService.getFeaturedProducts()
      }
      return products.map(p => this.convertToProductModel(p))
    } catch {
      return []
    }
  }
}

export const recommendationService = RecommendationService.getInstance()