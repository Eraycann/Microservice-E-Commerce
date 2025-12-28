/**
 * Recommendation Service TypeScript Tipleri
 * Backend RecommendationService API'larına uygun tip tanımları
 */

/**
 * Backend ProductDto'ya karşılık gelen tip
 */
export interface RecommendedProduct {
  id: string
  name: string
  price: number
  imageUrl: string
}

/**
 * Öneri API'sinden dönen response tipi
 */
export interface RecommendationResponse {
  userId?: string
  recommendations: RecommendedProduct[]
}

/**
 * AI Engine Request tipi
 */
export interface RecommendationRequest {
  userId?: string
  guestId?: string
}

/**
 * Kullanıcı etkileşim event tipleri
 */
export type InteractionEventType = 'VIEW' | 'ADD_TO_CART' | 'PURCHASE'

/**
 * Kullanıcı etkileşim event'i
 */
export interface UserInteractionEvent {
  userId?: string
  guestId?: string
  productId: string
  eventType: InteractionEventType
  timestamp?: number
}

/**
 * Model eğitim response'u
 */
export interface TrainingResponse {
  message: string
  status?: string
}

/**
 * AI Engine health check response'u
 */
export interface AIEngineStatus {
  status: string
  model_trained: boolean
}

/**
 * Öneri bileşeni props'ları
 */
export interface RecommendationProps {
  userId?: string
  guestId?: string
  title?: string
  maxItems?: number
  showTitle?: boolean
  className?: string
}

/**
 * Benzer ürünler bileşeni props'ları
 */
export interface SimilarProductsProps {
  currentProductId: string
  userId?: string
  guestId?: string
  title?: string
  maxItems?: number
  className?: string
}

/**
 * Öneri servisi hata tipleri
 */
export interface RecommendationError {
  code: 'AI_ENGINE_DOWN' | 'NO_RECOMMENDATIONS' | 'NETWORK_ERROR' | 'UNKNOWN'
  message: string
  fallbackUsed?: boolean
}

/**
 * Öneri servisi konfigürasyonu
 */
export interface RecommendationConfig {
  maxRetries: number
  retryDelay: number
  fallbackToPopular: boolean
  trackInteractions: boolean
}