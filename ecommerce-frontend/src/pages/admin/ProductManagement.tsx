/**
 * Product Management Page
 * 
 * Admin interface for managing products with full CRUD operations
 * Integrates with backend ProductController and SearchService
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth'
import { adminService } from '@/services/adminService'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import { productService } from '@/services/productService'
import type { ProductCreateRequest, ProductUpdateRequest } from '@/services/adminService'
import type { Product } from '@/types/product'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2,
  AlertTriangle,
  Package,
  Eye,
  EyeOff,
  Star,
  Upload,
  DollarSign
} from 'lucide-react'

export const ProductManagement: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [useImageUpload, setUseImageUpload] = useState(false)
  
  const [formData, setFormData] = useState<ProductCreateRequest>({
    name: '',
    description: '',
    price: 0,
    categoryId: 0,
    brandId: 0,
    initialStockCount: 0,
    specsData: '{}'
  })

  // Check admin access - backend will handle authorization
  
  // Fetch products with search
  const {
    data: productsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-products', currentPage, searchQuery],
    queryFn: async () => {
      if (searchQuery.trim()) {
        // Use search service for filtering
        const searchResults = await productService.searchProducts({
          q: searchQuery,
          page: currentPage,
          size: 20
        })
        return {
          content: searchResults.products,
          totalElements: searchResults.totalElements,
          totalPages: searchResults.totalPages
        }
      } else {
        // Get all products (you might need to implement this endpoint)
        const allProducts = await productService.getAllProducts(currentPage, 20)
        return allProducts
      }
    },
    enabled: isAuthenticated,
    retry: 2
  })

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
    enabled: isAuthenticated
  })

  // Fetch brands for dropdown
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandService.getAllBrands(),
    enabled: isAuthenticated
  })

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: (request: ProductCreateRequest) => {
      if (useImageUpload && selectedImages.length > 0) {
        return adminService.createProductWithImages(request, selectedImages)
      } else {
        return adminService.createProduct(request)
      }
    },
    onSuccess: (newProduct) => {
      // Hem cache'i invalidate et hem de manuel olarak güncelle
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      
      // Başarı mesajı göster
      console.log('[ProductManagement] Ürün başarıyla oluşturuldu:', newProduct.name)
      
      // Formu temizle ve kapat
      setShowCreateForm(false)
      resetForm()
      
      // Listeyi yenile
      refetch()
    },
    onError: (error) => {
      console.error('[ProductManagement] Create failed:', error)
      // Hata mesajı göster (gelecekte toast notification eklenebilir)
    }
  })

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string | number; request: ProductUpdateRequest }) => 
      adminService.updateProduct(id, request),
    onSuccess: (updatedProduct) => {
      // Cache'i invalidate et ve listeyi yenile
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      
      console.log('[ProductManagement] Ürün başarıyla güncellendi:', updatedProduct.name)
      
      setEditingProduct(null)
      resetForm()
      refetch()
    },
    onError: (error) => {
      console.error('[ProductManagement] Update failed:', error)
    }
  })

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => adminService.deleteProduct(id),
    onSuccess: () => {
      // Cache'i invalidate et ve listeyi yenile
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      refetch()
    },
    onError: (error) => {
      console.error('[ProductManagement] Delete failed:', error)
    }
  })

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string | number; featured: boolean }) => 
      adminService.updateFeaturedStatus(id, featured),
    onSuccess: () => {
      // Cache'i invalidate et ve listeyi yenile
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['search', 'featured'] })
      refetch()
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      categoryId: 0,
      brandId: 0,
      initialStockCount: 0,
      specsData: '{}'
    })
    setSelectedImages([])
    setUseImageUpload(false)
  }

  const handleCreate = () => {
    // Eğer zaten bir işlem devam ediyorsa, tekrar başlatma
    if (createMutation.isPending) {
      console.log('[ProductManagement] Ürün oluşturma zaten devam ediyor, tekrar başlatılmadı')
      return
    }

    // Form validation - sadece temel alanlar
    if (!formData.name.trim()) {
      console.error('Ürün adı gerekli')
      return
    }
    
    if (!formData.description.trim()) {
      console.error('Ürün açıklaması gerekli')
      return
    }
    
    if (formData.price <= 0) {
      console.error('Geçerli bir fiyat girin')
      return
    }
    
    if (!formData.categoryId || formData.categoryId === 0) {
      console.error('Kategori seçin')
      return
    }
    
    if (!formData.brandId || formData.brandId === 0) {
      console.error('Marka seçin')
      return
    }
    
    console.log('[ProductManagement] Creating product with data:', formData)
    createMutation.mutate(formData)
  }

  const handleUpdate = () => {
    // Eğer zaten bir işlem devam ediyorsa, tekrar başlatma
    if (updateMutation.isPending) {
      console.log('[ProductManagement] Ürün güncelleme zaten devam ediyor, tekrar başlatılmadı')
      return
    }

    if (!editingProduct || !formData.name.trim()) return
    
    console.log('[ProductManagement] Updating product:', editingProduct.id, formData)
    updateMutation.mutate({
      id: editingProduct.id,
      request: formData
    })
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: typeof product.category?.id === 'string' ? parseInt(product.category.id) : (product.category?.id || 0),
      brandId: typeof product.brand?.id === 'string' ? parseInt(product.brand.id) : (product.brand?.id || 0),
      initialStockCount: product.stockQuantity || 0,
      specsData: JSON.stringify(product.specs || {})
    })
    setShowCreateForm(false)
  }

  const handleDelete = (product: Product) => {
    if (window.confirm(`"${product.name}" ürününü silmek istediğinizden emin misiniz?`)) {
      deleteMutation.mutate(product.id)
    }
  }

  const handleToggleFeatured = (product: Product) => {
    toggleFeaturedMutation.mutate({
      id: product.id,
      featured: !product.featured
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedImages(prev => [...prev, ...files].slice(0, 5)) // Max 5 images
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setShowCreateForm(false)
    resetForm()
  }

  // Access control - sadece authentication kontrolü
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Giriş Gerekli</h1>
          <p className="text-muted-foreground">
            Bu sayfaya erişmek için giriş yapmalısınız.
          </p>
        </div>
      </div>
    )
  }

  const products = productsData?.content || []
  const totalProducts = productsData?.totalElements || 0
  const totalPages = productsData?.totalPages || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Ürün Yönetimi</h1>
            <p className="text-muted-foreground">
              Toplam {totalProducts} ürün
            </p>
          </div>
          
          <Button
            onClick={() => {
              setShowCreateForm(true)
              setEditingProduct(null)
              resetForm()
            }}
            disabled={showCreateForm || editingProduct !== null}
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ürün
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingProduct) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Oluştur'}
              </CardTitle>
              <CardDescription>
                {editingProduct 
                  ? 'Ürün bilgilerini güncelleyin' 
                  : 'Yeni bir ürün oluşturun'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Ürün Adı *
                    </label>
                    <Input
                      placeholder="Ürün adını girin"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Açıklama *
                    </label>
                    <Textarea
                      placeholder="Ürün açıklaması"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Fiyat (TL) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Başlangıç Stok Miktarı
                    </label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.initialStockCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, initialStockCount: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Kategori *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: parseInt(e.target.value) }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value={0}>Kategori Seçin</option>
                      {categories?.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Marka *
                    </label>
                    <select
                      value={formData.brandId}
                      onChange={(e) => setFormData(prev => ({ ...prev, brandId: parseInt(e.target.value) }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value={0}>Marka Seçin</option>
                      {brands?.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Resim Yükleme Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useImageUpload"
                      checked={useImageUpload}
                      onChange={(e) => setUseImageUpload(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="useImageUpload" className="text-sm font-medium">
                      Resim yükle
                    </label>
                  </div>

                  {/* Resim Yükleme Alanı */}
                  {useImageUpload && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Ürün Resimleri (Maksimum 5)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            Resim yüklemek için tıklayın
                          </span>
                        </label>
                      </div>
                      
                      {/* Seçilen Resimler */}
                      {selectedImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {selectedImages.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-6 border-t mt-6">
                <Button
                  onClick={editingProduct ? handleUpdate : handleCreate}
                  disabled={
                    !formData.name.trim() || 
                    formData.categoryId === 0 || 
                    formData.brandId === 0 ||
                    createMutation.isPending || 
                    updateMutation.isPending
                  }
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingProduct ? 'Güncelle' : 'Oluştur'}
                </Button>
                
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Ürünler yükleniyor...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <p className="font-medium text-red-900 mb-2">
                  Ürünler yüklenirken hata oluştu
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
        ) : products.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleFeatured={handleToggleFeatured}
                  isDeleting={deleteMutation.isPending}
                  isTogglingFeatured={toggleFeaturedMutation.isPending}
                />
              ))}
            </div>

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
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? 'Ürün bulunamadı' : 'Henüz ürün yok'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? 'Arama kriterlerinize uygun ürün bulunamadı.'
                    : 'İlk ürünü oluşturmak için yukarıdaki butonu kullanın.'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    İlk Ürünü Oluştur
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Product Card Component
interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onToggleFeatured: (product: Product) => void
  isDeleting: boolean
  isTogglingFeatured: boolean
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleFeatured,
  isDeleting,
  isTogglingFeatured
}) => {
  return (
    <Card className={`${!product.active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 mb-2">
              {product.name}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{product.category?.name}</span>
              <span>•</span>
              <span>{product.brand?.name}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {product.featured && (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            )}
            {product.active ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Price and Stock */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">
                ₺{product.price.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Stok: {product.stockQuantity}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              ID: {product.id}
            </div>
            
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggleFeatured(product)}
                disabled={isTogglingFeatured}
              >
                {isTogglingFeatured ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Star className={`w-3 h-3 ${product.featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(product)}
              >
                <Edit className="w-3 h-3" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(product)}
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

export default ProductManagement