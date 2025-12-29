import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { recommendationService } from '@/services/recommendationService'
import { toast } from 'sonner'
import { 
  BrainCircuit, 
  Sparkles, 
  Loader2, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react'

export const AiModelManager = () => {
  const [loading, setLoading] = useState(false)
  const [lastTrained, setLastTrained] = useState<string | null>(null)

  const handleTrainModel = async () => {
    setLoading(true)
    try {
      // Servise istek at
      const message = await recommendationService.trainModel()
      
      // Başarılı olursa
      toast.success('Eğitim Başlatıldı', {
        description: 'Yapay zeka modeli arka planda yeniden eğitiliyor.'
      })
      
      // Anlık saati kaydet
      const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      setLastTrained(now)
      
    } catch (error) {
      console.error('Training failed:', error)
      toast.error('Hata Oluştu', {
        description: 'Model eğitimi başlatılamadı. Lütfen logları kontrol edin.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-indigo-100 overflow-hidden relative">
      {/* Arka plan dekorasyonu */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl pointer-events-none" />

      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BrainCircuit className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Yapay Zeka Motoru</CardTitle>
            <CardDescription>Öneri sistemini güncelle</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-600 border border-slate-100">
            <p className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <span>
                Kullanıcı etkileşimlerini (tıklama, sepete atma, satın alma) analiz ederek öneri modelini yeniden eğitir.
              </span>
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              {lastTrained ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Son tetikleme: {lastTrained}
                </span>
              ) : (
                <span>Durum: Hazır</span>
              )}
            </div>

            <Button 
              onClick={handleTrainModel} 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eğitiliyor...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Modeli Eğit
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AiModelManager