/**
 * Question Servisi
 * 
 * Backend QuestionController API'larına uygun soru-cevap işlemleri:
 * - POST /api/v1/questions - Soru sor
 * - GET /api/v1/questions/product/{productId} - Ürün sorularını getir
 * - PUT /api/v1/questions/{questionId}/answer - Soruyu cevapla (Admin)
 * - GET /api/v1/questions/pending - Cevaplanmamış sorular (Admin)
 */

import { apiClient } from '@/lib/axios'

export interface ProductQuestion {
  id: string
  productId: string
  userId: string
  userFullName: string
  question: string
  answer?: string
  answeredBy?: string
  askDate: string
  answerDate?: string
  isAnswered: boolean
}

export interface QuestionRequest {
  productId: string
  question: string
}

export interface AnswerRequest {
  answer: string
}

export interface QuestionResponse {
  id: string
  productId: string
  userId: string
  userFullName: string
  question: string
  answer?: string
  answeredBy?: string
  askDate: string
  answerDate?: string
  isAnswered: boolean
}

export interface PaginatedQuestions {
  content: QuestionResponse[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export class QuestionService {
  private static instance: QuestionService
  private readonly baseUrl = '/api/v1/questions'

  private constructor() {}

  public static getInstance(): QuestionService {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService()
    }
    return QuestionService.instance
  }

  /**
   * Soru sor
   * Backend: POST /api/v1/questions
   */
  async askQuestion(request: QuestionRequest): Promise<ProductQuestion> {
    console.log('[QuestionService] Soru soruluyor...', request)
    const response = await apiClient.post<ProductQuestion>(this.baseUrl, request)
    console.log('[QuestionService] Soru soruldu:', response.data)
    return response.data
  }

  /**
   * Ürün sorularını getir
   * Backend: GET /api/v1/questions/product/{productId}
   */
  async getProductQuestions(
    productId: string, 
    page: number = 0, 
    size: number = 10
  ): Promise<PaginatedQuestions> {
    console.log('[QuestionService] Ürün soruları getiriliyor:', productId)
    const response = await apiClient.get<PaginatedQuestions>(
      `${this.baseUrl}/product/${productId}`,
      { params: { page, size } }
    )
    console.log('[QuestionService] Ürün soruları alındı:', response.data.totalElements, 'soru')
    return response.data
  }

  /**
   * Soruyu cevapla (Admin)
   * Backend: PUT /api/v1/questions/{questionId}/answer
   */
  async answerQuestion(questionId: string, request: AnswerRequest): Promise<ProductQuestion> {
    console.log('[QuestionService] Soru cevaplanıyor:', questionId, request)
    const response = await apiClient.put<ProductQuestion>(
      `${this.baseUrl}/${questionId}/answer`, 
      request
    )
    console.log('[QuestionService] Soru cevaplandı:', response.data)
    return response.data
  }

  /**
   * Cevaplanmamış soruları getir (Admin)
   * Backend: GET /api/v1/questions/pending
   */
  async getPendingQuestions(page: number = 0, size: number = 20): Promise<PaginatedQuestions> {
    console.log('[QuestionService] Cevaplanmamış sorular getiriliyor...')
    const response = await apiClient.get<PaginatedQuestions>(
      `${this.baseUrl}/pending`,
      { params: { page, size } }
    )
    console.log('[QuestionService] Cevaplanmamış sorular alındı:', response.data.totalElements, 'soru')
    return response.data
  }
}

// Singleton instance'ı export et
export const questionService = QuestionService.getInstance()