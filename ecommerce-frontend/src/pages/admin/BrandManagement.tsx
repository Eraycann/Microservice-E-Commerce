/**
 * Brand Management Page
 * 
 * Admin interface for managing product brands
 * CRUD operations for brands with logo upload support
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth'
import { brandService } from '@/services/brandService'
import type { Brand, BrandCreateRequest } from '@/services/brandService'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2,
  AlertTriangle,
  Building,
  Eye,
  EyeOff,
  ExternalLink,
  Image
} from 'lucide-react'

export const BrandManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<BrandCreateRequest>({
    name: '',
    description: '',
    logoUrl: '',
    websiteUrl: '',
    active: true
  })

  // Backend will handle admin authorization

  // Fetch brands
  const {
    data: brands,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandService.getAllBrands(),
    enabled: isAuthenticated,
    retry: 2
  })

  // Create brand mutation
  const createMutation = useMutation({
    mutationFn: (request: BrandCreateRequest) => brandService.createBrand(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      setShowCreateForm(false)
      resetForm()
    },
    onError: (error) => {
      console.error('[BrandManagement] Create failed:', error)
    }
  })

  // Update brand mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: BrandCreateRequest }) => 
      brandService.updateBrand(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      setEditingBrand(null)
      resetForm()
    },
    onError: (error) => {
      console.error('[BrandManagement] Update failed:', error)
    }
  })

  // Delete brand mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => brandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
    onError: (error) => {
      console.error('[BrandManagement] Delete failed:', error)
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logoUrl: '',
      websiteUrl: '',
      active: true
    })
  }

  const handleCreate = () => {
    if (!formData.name.trim()) return
    createMutation.mutate(formData)
  }

  const handleUpdate = () => {
    if (!editingBrand || !formData.name.trim()) return
    updateMutation.mutate({
      id: editingBrand.id,
      request: formData
    })
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logoUrl: brand.logoUrl || '',
      websiteUrl: brand.websiteUrl || '',
      active: brand.active
    })
    setShowCreateForm(false)
  }

  const handleDelete = (brand: Brand) => {
    if (window.confirm(`"${brand.name}" markasını silmek istediğinizden emin misiniz?`)) {
      deleteMutation.mutate(brand.id)
    }
  }

  const cancelEdit = () => {
    setEditingBrand(null)
    setShowCreateForm(false)
    resetForm()
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Marka Yönetimi</h1>
            <p className="text-muted-foreground">
              Ürün markalarını yönetin
            </p>
          </div>
          
          <Button
            onClick={() => {
              setShowCreateForm(true)
              setEditingBrand(null)
              resetForm()
            }}
            disabled={showCreateForm || editingBrand !== null}
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Marka
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingBrand) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingBrand ? 'Marka Düzenle' : 'Yeni Marka Oluştur'}
              </CardTitle>
              <CardDescription>
                {editingBrand 
                  ? 'Marka bilgilerini güncelleyin' 
                  : 'Yeni bir ürün markası oluşturun'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Marka Adı *
                  </label>
                  <Input
                    placeholder="Marka adını girin"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Açıklama
                  </label>
                  <Textarea
                    placeholder="Marka açıklaması (opsiyonel)"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Logo URL
                  </label>
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Website URL
                  </label>
                  <Input
                    placeholder="https://example.com"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="active" className="text-sm font-medium">
                    Aktif marka
                  </label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={editingBrand ? handleUpdate : handleCreate}
                    disabled={
                      !formData.name.trim() || 
                      createMutation.isPending || 
                      updateMutation.isPending
                    }
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {editingBrand ? 'Güncelle' : 'Oluştur'}
                  </Button>
                  
                  <Button variant="outline" onClick={cancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    İptal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brands List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Markalar yükleniyor...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <p className="font-medium text-red-900 mb-2">
                  Markalar yüklenirken hata oluştu
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
        ) : brands && brands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  Henüz marka yok
                </h3>
                <p className="text-muted-foreground mb-6">
                  İlk markayı oluşturmak için yukarıdaki butonu kullanın.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Markayı Oluştur
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Brand Card Component
interface BrandCardProps {
  brand: Brand
  onEdit: (brand: Brand) => void
  onDelete: (brand: Brand) => void
  isDeleting: boolean
}

const BrandCard: React.FC<BrandCardProps> = ({ 
  brand, 
  onEdit, 
  onDelete, 
  isDeleting 
}) => {
  return (
    <Card className={`${!brand.active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            {brand.logoUrl ? (
              <img 
                src={brand.logoUrl} 
                alt={brand.name}
                className="w-8 h-8 mr-2 object-contain rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <Building className="w-5 h-5 mr-2 text-primary" />
            )}
            {brand.name}
          </CardTitle>
          <div className="flex items-center space-x-1">
            {brand.active ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
        {brand.description && (
          <CardDescription className="line-clamp-2">
            {brand.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Website Link */}
          {brand.websiteUrl && (
            <div className="flex items-center space-x-2 text-sm">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <a 
                href={brand.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {brand.websiteUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {/* Logo URL */}
          {brand.logoUrl && (
            <div className="flex items-center space-x-2 text-sm">
              <Image className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">
                Logo mevcut
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              ID: {brand.id}
            </div>
            
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(brand)}
              >
                <Edit className="w-3 h-3" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(brand)}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700"
              >
                {isDeleting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BrandManagement