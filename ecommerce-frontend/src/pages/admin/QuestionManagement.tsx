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
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

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

  const answerMutation = useMutation({
    mutationFn: ({ questionId, request }: { questionId: string; request: AnswerRequest }) => 
      questionService.answerQuestion(questionId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-questions'] })
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      setAnsweringQuestion(null)
      setAnswerText('')
      refetch()
    }
  })

  const handleAnswer = (questionId: string) => {
    if (answerMutation.isPending || !answerText.trim()) return
    const request: AnswerRequest = { answer: answerText.trim() }
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

  if (!isAuthenticated) return <div>Yetkisiz Erişim</div>

  const questions = questionsData?.content || []
  const totalQuestions = questionsData?.totalElements || 0
  const totalPages = questionsData?.totalPages || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Soru Yönetimi</h1>
            <p className="text-muted-foreground">Cevaplanmamış {totalQuestions} soru</p>
          </div>
          <Button onClick={() => refetch()} variant="outline"><MessageSquare className="w-4 h-4 mr-2" /> Yenile</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : error ? (
          <div className="text-red-500 text-center">Hata oluştu</div>
        ) : questions.length > 0 ? (
          <div className="space-y-6">
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                isAnswering={answeringQuestion === q.id}
                answerText={answerText}
                onAnswerTextChange={setAnswerText}
                onStartAnswering={() => { setAnsweringQuestion(q.id); setAnswerText(''); }}
                onCancelAnswering={() => { setAnsweringQuestion(null); setAnswerText(''); }}
                onSubmitAnswer={() => handleAnswer(q.id)}
                isSubmitting={answerMutation.isPending}
              />
            ))}
            {/* Pagination */}
            {totalPages > 1 && (
               <div className="flex justify-center gap-2 pt-4">
                 <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>Önceki</Button>
                 <Button variant="outline" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1}>Sonraki</Button>
               </div>
            )}
          </div>
        ) : (
          <div className="text-center p-12 text-muted-foreground">Bekleyen soru yok.</div>
        )}
      </div>
    </div>
  )
}

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
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><User size={20} /></div>
            <div>
              <CardTitle className="text-lg">{question.userFullName}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar size={14} /> {new Date(question.askDate).toLocaleDateString('tr-TR')}
                <Clock size={14} /> {new Date(question.askDate).toLocaleTimeString('tr-TR')}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground"><Package size={14} /> ID: {question.productId}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="font-medium mb-1">Soru:</p>
          {/* 👇 İŞTE BURASI: Artık kesin olarak questionText kullanıyoruz */}
          <p className="text-gray-800">{question.questionText}</p>
        </div>

        {isAnswering ? (
          <div className="space-y-3">
            <Textarea 
              placeholder="Cevabınız..." 
              value={answerText} 
              onChange={(e) => onAnswerTextChange(e.target.value)} 
              rows={4} 
            />
            <div className="flex gap-2">
              <Button onClick={onSubmitAnswer} disabled={!answerText.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Send className="mr-2 h-4 w-4"/>} Gönder
              </Button>
              <Button variant="outline" onClick={onCancelAnswering}>İptal</Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-sm text-yellow-600 flex items-center gap-1"><Clock size={14}/> Cevap bekleniyor</span>
            <Button onClick={onStartAnswering}><MessageSquare className="mr-2 h-4 w-4"/> Cevapla</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QuestionManagement