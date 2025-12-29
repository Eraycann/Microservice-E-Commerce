/**
 * ProductQA Component
 * Displays Q&A section for a product
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { questionService } from '@/services/questionService'
import type { QuestionResponse, QuestionRequest } from '@/services/questionService'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  HelpCircle,
  Loader2,
  MessageCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface ProductQAProps {
  productId: string
}

export const ProductQA: React.FC<ProductQAProps> = ({ productId }) => {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [questionText, setQuestionText] = useState('')
  const [isAsking, setIsAsking] = useState(false)

  // Fetch product questions
  const { 
    data: questionsData, 
    isLoading 
  } = useQuery({
    queryKey: ['questions', productId],
    queryFn: () => questionService.getProductQuestions(productId),
    enabled: !!productId
  })

  // Ask question mutation
  const askMutation = useMutation({
    mutationFn: (request: QuestionRequest) => questionService.askQuestion(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', productId] })
      setQuestionText('')
      setIsAsking(false)
      toast.success('Sorunuz başarıyla gönderildi')
    },
    onError: () => {
      toast.error('Soru gönderilirken bir hata oluştu')
    }
  })

  const handleAskQuestion = () => {
    if (!isAuthenticated) {
      toast.error('Soru sormak için giriş yapmalısınız')
      return
    }

    if (!questionText.trim()) return

    const request: QuestionRequest = {
      productId,
      question: questionText
    }

    askMutation.mutate(request)
  }

  const questions = questionsData?.content || []

  return (
    <div className="space-y-8" id="questions">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Sorular ve Cevaplar
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {questions.length > 0 ? `${questions.length} soru soruldu` : 'Henüz soru sorulmamış'}
          </span>
        </h2>
        
        {!isAsking && (
          <Button 
            variant="outline" 
            onClick={() => isAuthenticated ? setIsAsking(true) : toast.error('Soru sormak için giriş yapmalısınız')}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Soru Sor
          </Button>
        )}
      </div>

      {/* Ask Question Form */}
      {isAsking && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium mb-4">Ürün Hakkında Soru Sor</h3>
            <Textarea
              placeholder="Sorunuzu buraya yazın..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="min-h-[100px] mb-4"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {questionText.length}/500
              </p>
              <div className="flex space-x-2">
                <Button variant="ghost" onClick={() => setIsAsking(false)}>
                  İptal
                </Button>
                <Button 
                  onClick={handleAskQuestion}
                  disabled={!questionText.trim() || askMutation.isPending}
                >
                  {askMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Soru Gönder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : questions.length > 0 ? (
          questions.map((question) => (
            <Card key={question.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    {/* User Info & Date */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="font-medium text-gray-900 mr-2">
                        {question.userFullName}
                      </span>
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{new Date(question.askDate).toLocaleDateString('tr-TR')}</span>
                    </div>

                    {/* Question Text */}
                    {/* 👇 KRİTİK DÜZELTME: question.questionText kullanıldı */}
                    <p className="text-gray-900 font-medium">
                      {question.questionText || (question as any).question}
                    </p>

                    {/* Answer Section */}
                    {/* 👇 KRİTİK DÜZELTME: answerText kontrolü */}
                    {(question.answerText || (question as any).answer) ? (
                      <div className="bg-green-50 rounded-lg p-4 mt-4 border border-green-100">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-green-800">
                            Satıcı Cevabı
                          </span>
                          <span className="text-xs text-green-600 ml-auto">
                            {question.answerDate && new Date(question.answerDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-green-900 text-sm pl-8">
                          {question.answerText || (question as any).answer}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 rounded-lg p-3 flex items-start mt-2 border border-yellow-100">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-yellow-800">
                          Bu soru henüz cevaplanmadı. En kısa sürede yanıtlanacaktır.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-medium text-lg mb-2">Henüz Soru Sorulmamış</h3>
            <p className="text-muted-foreground mb-4">
              Bu ürün hakkında aklınıza takılanları ilk siz sorun.
            </p>
            {!isAsking && (
              <Button onClick={() => isAuthenticated ? setIsAsking(true) : toast.error('Lütfen giriş yapın')} variant="outline">
                Soru Sor
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductQA