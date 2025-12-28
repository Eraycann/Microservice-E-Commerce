/**
 * Question Management Page
 * 
 * Admin interface for managing product questions and answers
 * View pending questions and provide answers
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth'
import { questionService } from '@/services/questionService'
import type { QuestionResponse, AnswerRequest } from '@/services/questionService'
import { 
  MessageSquare, 
  Send, 
  User, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Clock,
  Package
} from 'lucide-react'

export const QuestionManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  // Backend will handle admin authorization

  // Fetch pending questions
  const {
    data: questionsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-pending-questions', currentPage],
    queryFn: () => questionService.getPendingQuestions(currentPage, 20),
    enabled: isAuthenticated,
    retry: 2
  })

  // Answer question mutation
  const answerMutation = useMutation({
    mutationFn: ({ questionId, request }: { questionId: string; request: AnswerRequest }) => 
      questionService.answerQuestion(questionId, request),
    onSuccess: (answeredQuestion) => {
      // Cache'i invalidate et ve listeyi yenile
      queryClient.invalidateQueries({ queryKey: ['admin-pending-questions'] })
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      
      console.log('[QuestionManagement] Soru başarıyla cevaplandı:', answeredQuestion.id)
      
      setAnsweringQuestion(null)
      setAnswerText('')
      
      // Listeyi yenile
      refetch()
    },
    onError: (error) => {
      console.error('[QuestionManagement] Answer failed:', error)
    }
  })

  const handleAnswer = (questionId: string) => {
    // Eğer zaten bir işlem devam ediyorsa, tekrar başlatma
    if (answerMutation.isPending) {
      console.log('[QuestionManagement] Cevap verme işlemi zaten devam ediyor')
      return
    }

    if (!answerText.trim()) return
    
    const request: AnswerRequest = {
      answer: answerText.trim()
    }

    console.log('[QuestionManagement] Soruya cevap veriliyor:', questionId)
    answerMutation.mutate({ questionId, request })
  }

  const startAnswering = (questionId: string) => {
    setAnsweringQuestion(questionId)
    setAnswerText('')
  }

  const cancelAnswering = () => {
    setAnsweringQuestion(null)
    setAnswerText('')
  }

  // Access control - sadece authentication kontrolü
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erişim Reddedildi</h1>
          <p className="text-muted-foreground">
            Bu sayfaya erişmek için admin yetkisine sahip olmalısınız.
          </p>
        </div>
      </div>
    )
  }

  const questions = questionsData?.content || []
  const totalQuestions = questionsData?.totalElements || 0
  const totalPages = questionsData?.totalPages || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Soru Yönetimi</h1>
            <p className="text-muted-foreground">
              Cevaplanmamış {totalQuestions} soru
            </p>
          </div>
          
          <Button onClick={() => refetch()} variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>

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
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
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
          <div className="space-y-6">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                isAnswering={answeringQuestion === question.id}
                answerText={answerText}
                onAnswerTextChange={setAnswerText}
                onStartAnswering={() => startAnswering(question.id)}
                onCancelAnswering={cancelAnswering}
                onSubmitAnswer={() => handleAnswer(question.id)}
                isSubmitting={answerMutation.isPending}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <Button
                  variant="outline"
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
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  Tüm sorular cevaplanmış!
                </h3>
                <p className="text-muted-foreground">
                  Şu anda cevaplanmayı bekleyen soru bulunmuyor.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Question Card Component
interface QuestionCardProps {
  question: QuestionResponse
  isAnswering: boolean
  answerText: string
  onAnswerTextChange: (text: string) => void
  onStartAnswering: () => void
  onCancelAnswering: () => void
  onSubmitAnswer: () => void
  isSubmitting: boolean
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isAnswering,
  answerText,
  onAnswerTextChange,
  onStartAnswering,
  onCancelAnswering,
  onSubmitAnswer,
  isSubmitting
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{question.userFullName}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(question.askDate).toLocaleDateString('tr-TR')}</span>
                <Clock className="w-4 h-4 ml-2" />
                <span>{new Date(question.askDate).toLocaleTimeString('tr-TR')}</span>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>Ürün ID: {question.productId}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Question */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-900 font-medium mb-2">Soru:</p>
          <p className="text-gray-800">{question.question}</p>
        </div>

        {/* Answer Form */}
        {isAnswering ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Cevabınız:
              </label>
              <Textarea
                placeholder="Soruya cevabınızı yazın..."
                value={answerText}
                onChange={(e) => onAnswerTextChange(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {answerText.length}/1000 karakter
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={onSubmitAnswer}
                disabled={!answerText.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Cevabı Gönder
              </Button>
              
              <Button variant="outline" onClick={onCancelAnswering}>
                İptal
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-yellow-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Cevap bekleniyor</span>
            </div>
            
            <Button onClick={onStartAnswering}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Cevapla
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QuestionManagement