/**
 * Admin Dashboard Page
 * * Comprehensive admin dashboard with statistics and management tools
 * Only accessible to users with admin role
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth'
import { adminService, type AdminStats } from '@/services/adminService'
import { questionService, type PaginatedQuestions } from '@/services/questionService'
// 👇 YENİ: AiModelManager import edildi
import AiModelManager from './AiModelManager'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  AlertTriangle,
  MessageSquare,
  Settings,
  Plus,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react'

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  // Dashboard stats query
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminService.getDashboardStats(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
    retry: 2
  })

  // Pending questions query
  const {
    data: pendingQuestions,
    isLoading: questionsLoading,
    refetch: refetchQuestions
  } = useQuery({
    queryKey: ['admin-pending-questions'],
    queryFn: () => questionService.getPendingQuestions(0, 5),
    enabled: isAuthenticated,
    retry: 1
  })

  // Access control
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Giriş Gerekli</h1>
          <p className="text-muted-foreground mb-6">
            Admin paneline erişmek için giriş yapmalısınız.
          </p>
          <Button onClick={() => navigate('/login')}>
            Giriş Yap
          </Button>
        </div>
      </div>
    )
  }

  const handleRefreshAll = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        refetchStats(),
        refetchQuestions()
      ])
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              E-ticaret platformu yönetim paneli
            </p>
          </div>
          
          <Button
            onClick={handleRefreshAll}
            variant="outline"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Yenile
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Toplam Kullanıcı"
            value={stats?.totalUsers ?? 0}
            icon={<Users className="w-6 h-6" />}
            loading={statsLoading}
            color="text-blue-600"
          />
          
          <StatsCard
            title="Toplam Ürün"
            value={stats?.totalProducts ?? 0}
            icon={<Package className="w-6 h-6" />}
            loading={statsLoading}
            color="text-green-600"
          />
          
          <StatsCard
            title="Toplam Sipariş"
            value={stats?.totalOrders ?? 0}
            icon={<ShoppingCart className="w-6 h-6" />}
            loading={statsLoading}
            color="text-purple-600"
          />
          
          <StatsCard
            title="Toplam Gelir"
            value={`₺${(stats?.totalRevenue ?? 0).toLocaleString('tr-TR')}`}
            icon={<DollarSign className="w-6 h-6" />}
            loading={statsLoading}
            color="text-orange-600"
          />
        </div>

        {/* Alert Cards & System Management */}
        {/* 👇 GÜNCELLENDİ: 2 sütundan 3 sütuna çıkarıldı ve AiModelManager eklendi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* 1. Kart: Düşük Stok */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-yellow-800">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Düşük Stok Uyarısı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900 mb-1">
                {statsLoading ? '...' : stats?.lowStockProducts ?? 0}
              </div>
              <p className="text-yellow-700 text-sm">
                Ürünün stoğu kritik seviyede
              </p>
            </CardContent>
          </Card>

          {/* 2. Kart: Bekleyen Sorular */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-blue-800">
                <MessageSquare className="w-5 h-5 mr-2" />
                Bekleyen Sorular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {questionsLoading ? '...' : pendingQuestions?.totalElements ?? 0}
              </div>
              <p className="text-blue-700 text-sm">
                Cevap bekleyen müşteri sorusu
              </p>
            </CardContent>
          </Card>

          {/* 3. Kart: Yapay Zeka Yöneticisi (YENİ EKLENDİ) */}
          <AiModelManager />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            title="Ürün Yönetimi"
            description="Ürün ekle, düzenle ve stok yönetimi"
            icon={<Package className="w-8 h-8" />}
            actions={[
              { label: 'Ürün Ekle', icon: <Plus className="w-4 h-4" />, onClick: () => navigate('/admin/products/new') },
              { label: 'Ürünleri Yönet', icon: <Eye className="w-4 h-4" />, onClick: () => navigate('/admin/products') },
            ]}
          />

          <QuickActionCard
            title="Kategori & Marka"
            description="Kategori ve marka yönetimi"
            icon={<Settings className="w-8 h-8" />}
            actions={[
              { label: 'Kategoriler', icon: <Eye className="w-4 h-4" />, onClick: () => navigate('/admin/categories') },
              { label: 'Markalar', icon: <Eye className="w-4 h-4" />, onClick: () => navigate('/admin/brands') },
            ]}
          />

          <QuickActionCard
            title="Soru & Cevap"
            description="Müşteri sorularını yönet"
            icon={<MessageSquare className="w-8 h-8" />}
            actions={[
              { label: 'Bekleyen Sorular', icon: <AlertTriangle className="w-4 h-4" />, onClick: () => navigate('/admin/questions') },
              { label: 'Tüm Sorular', icon: <Eye className="w-4 h-4" />, onClick: () => navigate('/admin/questions/all') },
            ]}
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Son Bekleyen Sorular</CardTitle>
            <CardDescription>
              Cevap bekleyen son 5 müşteri sorusu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : pendingQuestions?.content?.length ? (
              <div className="space-y-4">
                {pendingQuestions.content.map((question: any) => (
                  <div key={question.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{question.userFullName}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {question.questionText || question.question} {/* Fallback eklendi */}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(question.askDate).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/admin/questions/${question.id}`)}
                    >
                      Cevapla
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Bekleyen soru bulunmuyor
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Stats Card Component
interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  loading: boolean
  color: string
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, loading, color }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-2xl font-bold">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : value}
          </div>
        </div>
        <div className={color}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
)

// Quick Action Card Component
interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  actions: Array<{
    label: string
    icon: React.ReactNode
    onClick: () => void
  }>
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon, actions }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center space-x-3">
        <div className="text-primary">
          {icon}
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className="w-full justify-start"
          >
            {action.icon}
            <span className="ml-2">{action.label}</span>
          </Button>
        ))}
      </div>
    </CardContent>
  </Card>
)

export default AdminDashboard