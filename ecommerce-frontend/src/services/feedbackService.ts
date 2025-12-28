/**
 * Feedback Service
 * 
 * Backend FeedbackService API'larına uygun yorum ve soru servisi
 * ReviewController ve QuestionController entegrasyonu
 */

import { apiClient, fetchCsrfToken } from '@/lib/axios'
import type { 
  ReviewRequest,
  ReviewResponse,
  ProductRatingSummary,
  QuestionRequest,
  QuestionResponse,
  AnswerRequest,
  PaginatedResponse
} from '../types/feedback'

export class FeedbackService {
  private static instance: FeedbackService
  private readonly reviewsBaseUrl = '/api/v1/reviews'
  private readonly questionsBaseUrl = '/api/v1/questions'

  private constructor() {}

  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService()
    }
    return FeedbackService.instance
  }

  // ===== REVIEW API'leri =====


// feedbackService.ts içindeki addReview metodu:
  async addReview(
    reviewData: ReviewRequest,
    images?: File[]
  ): Promise<ReviewResponse> {
    try {
      const csrfToken = this.getCsrfTokenFromCookie()
      if (!csrfToken) {
        console.log('[FeedbackService] No CSRF token found, fetching...')
        await fetchCsrfToken()
      }

      const formData = new FormData()
      
      // Verileri ekle
      formData.append('productId', reviewData.productId)
      formData.append('rating', reviewData.rating.toString())
      formData.append('comment', reviewData.comment)
      
      // Resimleri ekle
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append('images', image, image.name || `image-${index}.jpg`)
        })
      }

      console.log("İstek atılan adres:", this.reviewsBaseUrl); 

      const response = await apiClient.post<ReviewResponse>(
        this.reviewsBaseUrl, 
        formData,
        {
          headers: {
            // 👇 KRİTİK DÜZELTME BURASI 👇
            // Axios'un global 'application/json' ayarını eziyoruz.
            // 'multipart/form-data' diyerek tarayıcının boundary eklemesine izin veriyoruz.
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      return response.data
    } catch (error: any) {
      console.error('[FeedbackService] Yorum ekleme hatası:', error)
      // ... hata yönetimi kodların aynı kalsın
      throw this.createFeedbackError(error, 'Yorum eklenirken bir hata oluştu')
    }
  }

  /**
   * Ürün yorumlarını getir (sayfalı)
   * Backend: GET /api/v1/reviews/{productId}
   */
  async getProductReviews(
    productId: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<ReviewResponse>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ReviewResponse>>(
        `${this.reviewsBaseUrl}/${productId}`,
        {
          params: { page, size }
        }
      )

      return response.data
    } catch (error: any) {
      console.error('[FeedbackService] Yorumları getirme hatası:', error)
      throw this.createFeedbackError(error, 'Yorumlar yüklenirken bir hata oluştu')
    }
  }

  /**
   * Ürün puan özetini getir
   * Backend: GET /api/v1/reviews/summary/{productId}
   */
  async getProductRatingSummary(productId: string): Promise<ProductRatingSummary> {
    try {
      const response = await apiClient.get<ProductRatingSummary>(
        `${this.reviewsBaseUrl}/summary/${productId}`
      )

      return response.data
    } catch (error: any) {
      console.error('[FeedbackService] Puan özeti hatası:', error)
      throw this.createFeedbackError(error, 'Puan özeti yüklenirken bir hata oluştu')
    }
  }

  /**
   * Yoruma oy ver (faydalı)
   * Backend: POST /api/v1/reviews/{reviewId}/vote
   */
  async voteReview(reviewId: string): Promise<void> {
    try {
      await apiClient.post(`${this.reviewsBaseUrl}/${reviewId}/vote`)
    } catch (error: any) {
      console.error('[FeedbackService] Oy verme hatası:', error)
      throw this.createFeedbackError(error, 'Oy verilirken bir hata oluştu')
    }
  }

  // ===== QUESTION API'leri =====

  /**
   * Soru sor
   * Backend: POST /api/v1/questions
   */
  async askQuestion(questionData: QuestionRequest): Promise<QuestionResponse> {
    try {
      // CSRF token yoksa önce almaya çalış
      const csrfToken = this.getCsrfTokenFromCookie()
      if (!csrfToken) {
        console.log('[FeedbackService] No CSRF token found, fetching...')
        await fetchCsrfToken()
      }

      console.log('[FeedbackService] Sending question request:', {
        productId: questionData.productId,
        questionText: questionData.questionText.substring(0, 50) + '...'
      })

      const response = await apiClient.post<QuestionResponse>(
        this.questionsBaseUrl,
        questionData
      )

      console.log('[FeedbackService] Question submitted successfully:', response.data.id)
      return response.data
    } catch (error: any) {
      console.error('[FeedbackService] Soru sorma hatası:', error)
      
      // Detaylı hata loglama
      if (error.response) {
        console.error('[FeedbackService] Response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        })
      }
      
      throw this.createFeedbackError(error, 'Soru sorulurken bir hata oluştu')
    }
  }

  /**
   * Ürün sorularını getir
   * Backend: GET /api/v1/questions/product/{productId}
   */
  async getProductQuestions(
    productId: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<QuestionResponse>> {
    try {
      const response = await apiClient.get<PaginatedResponse<QuestionResponse>>(
        `${this.questionsBaseUrl}/product/${productId}`,
        {
          params: { page, size }
        }
      )

      return response.data
    } catch (error: any) {
      console.error('[FeedbackService] Soruları getirme hatası:', error)
      throw this.createFeedbackError(error, 'Sorular yüklenirken bir hata oluştu')
    }
  }

  /**
   * Soruyu cevapla (ADMIN only)
   * Backend: PUT /api/v1/questions/{questionId}/answer
   */
  async answerQuestion(
    questionId: string,
    answerData: AnswerRequest
  ): Promise<QuestionResponse> {
    try {
      const response = await apiClient.put<QuestionResponse>(
        `${this.questionsBaseUrl}/${questionId}/answer`,
        answerData
      )

      return response.data
    } catch (error: any) {
      console.error('[FeedbackService] Soru cevaplama hatası:', error)
      throw this.createFeedbackError(error, 'Soru cevaplanırken bir hata oluştu')
    }
  }

  /**
   * Cevaplanmamış soruları getir (ADMIN only)
   * Backend: GET /api/v1/questions/pending
   */
  async getPendingQuestions(
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<QuestionResponse>> {
    try {
      const response = await apiClient.get<PaginatedResponse<QuestionResponse>>(
        `${this.questionsBaseUrl}/pending`,
        {
          params: { page, size }
        }
      )

      return response.data
    } catch (error: any) {
      console.error('[FeedbackService] Bekleyen soruları getirme hatası:', error)
      throw this.createFeedbackError(error, 'Bekleyen sorular yüklenirken bir hata oluştu')
    }
  }

  // ===== Yardımcı Metodlar =====

  /**
   * CSRF token'ı çerezden oku
   */
  private getCsrfTokenFromCookie(): string | null {
    const name = 'XSRF-TOKEN'
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    
    if (parts.length === 2) {
      const token = parts.pop()?.split(';').shift()
      return token ? decodeURIComponent(token) : null
    }
    
    return null
  }

  /**
   * Hata objesi oluştur
   */
  private createFeedbackError(error: any, defaultMessage: string): Error {
    console.error('[FeedbackService] Detailed error info:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    })

    if (error.response?.status === 401) {
      return new Error('Bu işlem için giriş yapmanız gerekiyor')
    }
    
    if (error.response?.status === 403) {
      const errorData = error.response.data
      if (typeof errorData === 'string' && errorData.includes('CSRF')) {
        return new Error('Güvenlik doğrulaması başarısız. Sayfayı yenileyin ve tekrar deneyin.')
      }
      return new Error('Bu işlem için yetkiniz bulunmuyor')
    }
    
    if (error.response?.status === 404) {
      return new Error('İstenen kaynak bulunamadı')
    }
    
    if (error.response?.status === 400) {
      return new Error(error.response.data?.message || 'Geçersiz veri gönderildi')
    }

    if (error.response?.status === 500) {
      const serverError = error.response.data?.message || error.response.data?.error || 'Sunucu hatası'
      return new Error(`Sunucu hatası: ${serverError}`)
    }
    
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return new Error('Ağ bağlantısı hatası')
    }
    
    return new Error(error.response?.data?.message || defaultMessage)
  }
}

// Singleton instance'ı export et
export const feedbackService = FeedbackService.getInstance()

/**
 * Feedback yardımcı fonksiyonları
 */
export const FeedbackUtils = {
  /**
   * Yıldız puanını yüzdeye çevir
   */
  ratingToPercentage(rating: number): number {
    return (rating / 5) * 100
  },

  /**
   * Puan dağılımını hesapla
   */
  calculateRatingDistribution(starCounts: Record<number, number>): Array<{
    stars: number
    count: number
    percentage: number
  }> {
    const total = Object.values(starCounts).reduce((sum, count) => sum + count, 0)
    
    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: starCounts[stars] || 0,
      percentage: total > 0 ? ((starCounts[stars] || 0) / total) * 100 : 0
    }))
  },

  /**
   * Ortalama puanı formatla
   */
  formatAverageRating(rating: number): string {
    return rating.toFixed(1)
  },

  /**
   * Yorum sayısını formatla
   */
  formatReviewCount(count: number): string {
    if (count === 0) return 'Henüz yorum yok'
    if (count === 1) return '1 yorum'
    return `${count} yorum`
  },

  /**
   * Soru sayısını formatla
   */
  formatQuestionCount(count: number): string {
    if (count === 0) return 'Henüz soru yok'
    if (count === 1) return '1 soru'
    return `${count} soru`
  },

  /**
   * Dosya boyutunu kontrol et (max 5MB)
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Sadece JPEG, PNG ve WebP formatları desteklenir' }
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Dosya boyutu 5MB\'dan büyük olamaz' }
    }
    
    return { valid: true }
  },

  /**
   * Birden fazla dosyayı kontrol et
   */
  validateImageFiles(files: File[]): { valid: boolean; errors: string[] } {
    const maxFiles = 5
    const errors: string[] = []
    
    if (files.length > maxFiles) {
      errors.push(`En fazla ${maxFiles} resim yükleyebilirsiniz`)
    }
    
    files.forEach((file, index) => {
      const validation = this.validateImageFile(file)
      if (!validation.valid) {
        errors.push(`Dosya ${index + 1}: ${validation.error}`)
      }
    })
    
    return { valid: errors.length === 0, errors }
  }
}