// src/services/questionService.ts

import { apiClient } from '@/lib/axios'

// Backend JSON çıktısına göre güncellendi
export interface QuestionResponse {
  id: string
  productId: string
  userId: string
  userFullName: string
  
  // 👇 TEKRAR DÜZELTİLDİ: Backend 'questionText' gönderiyor!
  questionText: string 
  
  // Backend cevabı 'answerText' değil, direkt null veya yok. 
  // Ama biz yine de answerText olarak bekleyelim, belki dolu gelince öyle geliyordur.
  // Eğer cevap alanı JSON'da hiç yoksa, undefined olur.
  answerText?: string 
  
  answeredBy?: string
  askDate: string
  answerDate?: string
  isAnswered: boolean
}

// ... Diğer kısımlar aynı ...
export interface QuestionRequest {
  productId: string
  question: string 
}

export interface AnswerRequest {
  answer: string
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

  async askQuestion(request: QuestionRequest): Promise<any> {
    const response = await apiClient.post(this.baseUrl, request)
    return response.data
  }

  async getProductQuestions(productId: string, page: number = 0, size: number = 10): Promise<PaginatedQuestions> {
    const response = await apiClient.get<PaginatedQuestions>(
      `${this.baseUrl}/product/${productId}`,
      { params: { page, size } }
    )
    return response.data
  }

  async answerQuestion(questionId: string, request: AnswerRequest): Promise<any> {
    const response = await apiClient.put(
      `${this.baseUrl}/${questionId}/answer`, 
      request
    )
    return response.data
  }

  async getPendingQuestions(page: number = 0, size: number = 20): Promise<PaginatedQuestions> {
    const response = await apiClient.get<PaginatedQuestions>(
      `${this.baseUrl}/pending`,
      { params: { page, size } }
    )
    return response.data
  }
}

export const questionService = QuestionService.getInstance()