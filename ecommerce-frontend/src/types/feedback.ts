/**
 * Feedback Types
 * 
 * Backend FeedbackService DTO'larına uygun tip tanımları
 * ReviewController ve QuestionController entegrasyonu
 */

// ===== REVIEW TYPES =====

export interface ReviewRequest {
  productId: string // Backend expects string, not number
  rating: number // 1-5 arası
  comment: string
  imageUrls?: string[] // Frontend'den gelen resim linkleri (opsiyonel)
}

export interface ReviewResponse {
  id: string
  username: string
  comment: string
  rating: number
  helpfulCount: number
  imageUrls: string[]
  createdAt: string // ISO string format
}

export interface ProductRatingSummary {
  productId: string
  averageRating: number
  totalReviews: number
  starCounts: Record<number, number> // { 5: 10, 4: 2, 3: 1, 2: 0, 1: 0 }
}

// ===== QUESTION TYPES =====

export interface QuestionRequest {
  productId: string // Backend expects string, not number
  questionText: string
}

export interface QuestionResponse {
  id: string
  productId: string
  userId: string
  userFullName: string
  questionText: string
  // Cevap alanları
  answerText?: string
  answeredBy?: string
  // Tarih alanları
  askDate: string // ISO string format
  answerDate?: string // ISO string format
}

export interface AnswerRequest {
  answerText: string
}

// ===== PAGINATION =====

export interface PaginatedResponse<T> {
  content: T[]
  pageable: {
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    pageSize: number
    pageNumber: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

// ===== UI COMPONENT PROPS =====

export interface ReviewFormProps {
  productId: string
  onReviewSubmitted?: (review: ReviewResponse) => void
  onCancel?: () => void
}

export interface ReviewListProps {
  productId: string
  reviews?: ReviewResponse[]
  isLoading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

export interface RatingSummaryProps {
  summary: ProductRatingSummary
  className?: string
}

export interface QuestionFormProps {
  productId: string
  onQuestionSubmitted?: (question: QuestionResponse) => void
  onCancel?: () => void
}

export interface QuestionListProps {
  productId: string
  questions?: QuestionResponse[]
  isLoading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

export interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

// ===== FORM VALIDATION =====

export interface ReviewFormData {
  rating: number
  comment: string
  images: File[]
}

export interface QuestionFormData {
  questionText: string
}

export interface ReviewValidationError {
  rating?: string
  comment?: string
  images?: string
}

export interface QuestionValidationError {
  questionText?: string
}

// ===== UTILITY TYPES =====

export interface RatingDistribution {
  stars: number
  count: number
  percentage: number
}

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
}

// ===== ADMIN TYPES =====

export interface AdminQuestionListProps {
  questions?: QuestionResponse[]
  isLoading?: boolean
  onAnswerQuestion?: (questionId: string, answer: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
}

export interface AnswerFormProps {
  questionId: string
  question: QuestionResponse
  onAnswerSubmitted?: (answer: QuestionResponse) => void
  onCancel?: () => void
}

// ===== CONSTANTS =====

export const RATING_LABELS: Record<number, string> = {
  1: 'Çok Kötü',
  2: 'Kötü',
  3: 'Orta',
  4: 'İyi',
  5: 'Mükemmel'
}

export const MAX_REVIEW_IMAGES = 5
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const REVIEW_VALIDATION_RULES = {
  comment: {
    minLength: 10,
    maxLength: 1000
  },
  rating: {
    min: 1,
    max: 5
  }
}

export const QUESTION_VALIDATION_RULES = {
  questionText: {
    minLength: 10,
    maxLength: 500
  }
}