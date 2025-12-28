/**
 * Category Management Page
 * 
 * Admin interface for managing product categories
 * CRUD operations for categories with proper validation
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth'
import { categoryService } from '@/services/categoryService'
import type { Category, CategoryCreateRequest } from '@/services/categoryService'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2,
  AlertTriangle,
  Tag,
  Eye,
  EyeOff
} from 'lucide-react'

export const CategoryManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<CategoryCreateRequest>({
    name: '',
    description: '',
    active: true
  })

  // Backend will handle admin authorization

  // Fetch categories
  const {
    data: categories,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
    enabled: isAuthenticated,
    retry: 2
  })

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (request: CategoryCreateRequest) => categoryService.createCategory(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowCreateForm(false)
      resetForm()
    },
    onError: (error) => {
      console.error('[CategoryManagement] Create failed:', error)
    }
  })

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: CategoryCreateRequest }) => 
      categoryService.updateCategory(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditingCategory(null)
      resetForm()
    },
    onError: (error) => {
      console.error('[CategoryManagement] Update failed:', error)
    }
  })

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error) => {
      console.error('[CategoryManagement] Delete failed:', error)
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      active: true
    })
  }

  const handleCreate = () => {
    if (!formData.name.trim()) return
    createMutation.mutate(formData)
  }

  const handleUpdate = () => {
    if (!editingCategory || !formData.name.trim()) return
    updateMutation.mutate({
      id: editingCategory.id,
      request: formData
    })
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      active: category.active
    })
    setShowCreateForm(false)
  }

  const handleDelete = (category: Category) => {
    if (window.confirm(`"${category.name}" kategorisini silmek istediğinizden emin misiniz?`)) {
      deleteMutation.mutate(category.id)
    }
  }

  const cancelEdit = () => {
    setEditingCategory(null)
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
            <h1 className="text-2xl font-bold">Kategori Yönetimi</h1>
            <p className="text-muted-foreground">
              Ürün kategorilerini yönetin
            </p>
          </div>
          
          <Button
            onClick={() => {
              setShowCreateForm(true)
              setEditingCategory(null)
              resetForm()
            }}
            disabled={showCreateForm || editingCategory !== null}
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Kategori
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingCategory) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Oluştur'}
              </CardTitle>
              <CardDescription>
                {editingCategory 
                  ? 'Kategori bilgilerini güncelleyin' 
                  : 'Yeni bir ürün kategorisi oluşturun'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Kategori Adı *
                  </label>
                  <Input
                    placeholder="Kategori adını girin"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Açıklama
                  </label>
                  <Textarea
                    placeholder="Kategori açıklaması (opsiyonel)"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
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
                    Aktif kategori
                  </label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={editingCategory ? handleUpdate : handleCreate}
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
                    {editingCategory ? 'Güncelle' : 'Oluştur'}
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

        {/* Categories List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Kategoriler yükleniyor...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <p className="font-medium text-red-900 mb-2">
                  Kategoriler yüklenirken hata oluştu
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
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
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
                <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  Henüz kategori yok
                </h3>
                <p className="text-muted-foreground mb-6">
                  İlk kategoriyi oluşturmak için yukarıdaki butonu kullanın.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Kategoriyi Oluştur
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Category Card Component
interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  isDeleting: boolean
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onEdit, 
  onDelete, 
  isDeleting 
}) => {
  return (
    <Card className={`${!category.active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Tag className="w-5 h-5 mr-2 text-primary" />
            {category.name}
          </CardTitle>
          <div className="flex items-center space-x-1">
            {category.active ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
        {category.description && (
          <CardDescription className="line-clamp-2">
            {category.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            ID: {category.id}
          </div>
          
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(category)}
            >
              <Edit className="w-3 h-3" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(category)}
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
      </CardContent>
    </Card>
  )
}

export default CategoryManagement