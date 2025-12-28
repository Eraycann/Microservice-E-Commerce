/**
 * Product Q&A Component
 * 
 * Displays product questions and answers with ability to ask new questions
 * Integrates with QuestionService for backend communication
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth'
import { questionService } from '@/services/questionService'
import type { ProductQuestion, QuestionRequest } from '@/services/questionService'
import { 
  MessageSquare, 
  Send, 
  User, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Minus
} from 'lucide-react'

interface ProductQAProps {
  productId: string
  className?: string
}

export const ProductQA: React.FC<ProductQAProps> = ({ productId, className = '' }) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  // Fetch product questions
  const {
    data: questionsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['product-questions', productId, currentPage],
    queryFn: () => questionService.getProductQuestions(productId, currentPage, 10),
    retry: 2
  })

  // Ask question mutation
  const askQuestionMutation = useMutation({
    mutationFn: (request: QuestionRequest) => questionService.askQuestion(request),
    onSuccess: () => {
      // Reset form
      setQuestionText('')
      setShowQuestionForm(false)
      
      // Refresh questions
      queryClient.invalidateQueries({ queryKey: ['product-questions', productId] })
      
      console.log('[ProductQA] Question asked successfully')
    },
    onError: (error) => {
      console.error('[ProductQA] Failed to ask question:', error)
    }
  })

  const handleAskQuestion = () => {
    if (!questionText.trim()) return

    const request: QuestionRequest = {
      productId,
      question: questionText.trim()
    }

    askQuestionMutation.mutate(request)
  }

  const questions = questionsData?.content || []
  const totalQuestions = questionsData?.totalElements || 0
  const totalPages = questionsData?.totalPages || 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Sorular ve Cevaplar</h2>
            <p className="text-sm text-muted-foreground">
              {totalQuestions} soru soruldu
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <Button
            onClick={() => setShowQuestionForm(!showQuestionForm)}
            variant={showQuestionForm ? "outline" : "default"}
            size="sm"
          >
            {showQuestionForm ? (
              <>
                <Minus className="w-4 h-4 mr-2" />
                İptal
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Soru Sor
              </>
            )}
          </Button>
        )}
      </div>

      {/* Question Form */}
      {showQuestionForm && isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Yeni Soru Sor</CardTitle>
            <CardDescription>
              Bu ürün hakkında merak ettiğiniz soruyu sorun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Sorunuzu buraya yazın..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                maxLength={500}
              />
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {questionText.length}/500 karakter
                </p>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowQuestionForm(false)
                      setQuestionText('')
                    }}
                  >
                    İptal
                  </Button>
                  
                  <Button
                    onClick={handleAskQuestion}
                    disabled={!questionText.trim() || askQuestionMutation.isPending}
                    size="sm"
                  >
                    {askQuestionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Gönder
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login prompt for guests */}
      {showQuestionForm && !isAuthenticated && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  Soru sormak için giriş yapın
                </p>
                <p className="text-sm text-blue-700">
                  Ürün hakkında soru sorabilmek için hesabınıza giriş yapmalısınız.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Sorular yükleniyor...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="font-medium text-red-900 mb-2">
                Sorular yüklenirken hata oluştu
              </p>
              <p className="text-sm text-red-700 mb-4">
                {error instanceof Error ? error.message : 'Bilinmeyen hata'}
              </p>
              <Button onClick={() => refetch()} size="sm" variant="outline">
                Tekrar Dene
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                Önceki
              </Button>
              
              <span className="text-sm text-muted-foreground px-4">
                Sayfa {currentPage + 1} / {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Sonraki
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Henüz soru sorulmamış
              </h3>
              <p className="text-muted-foreground mb-6">
                Bu ürün hakkında ilk soruyu siz sorun!
              </p>
              {isAuthenticated ? (
                <Button onClick={() => setShowQuestionForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Soruyu Sor
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Soru sormak için giriş yapın
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Question Card Component
interface QuestionCardProps {
  question: ProductQuestion
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <Card>
      <CardContent className="p-6">
        {/* Question */}
        <div className="mb-4">
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-medium text-sm">{question.userFullName}</p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(question.askDate).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
              <p className="text-gray-900">{question.question}</p>
            </div>
          </div>
        </div>

        {/* Answer */}
        {question.isAnswered && question.answer ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-medium text-sm text-green-900">
                    {question.answeredBy || 'Müşteri Hizmetleri'}
                  </p>
                  {question.answerDate && (
                    <div className="flex items-center space-x-1 text-xs text-green-700">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(question.answerDate).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}
                </div>
                <p className="text-green-900">{question.answer}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Bu soru henüz cevaplanmadı. En kısa sürede yanıtlanacaktır.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProductQA