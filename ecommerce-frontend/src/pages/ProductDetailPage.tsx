import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SimilarProducts } from '@/components/recommendation/SimilarProducts'
import { ProductQA } from '@/components/product/ProductQA'
import { useAuth } from '@/features/auth'
import { productService, ImageUtils } from '@/services/productService'
import { recommendationService } from '@/services/recommendationService'
import { feedbackService, FeedbackUtils } from '@/services/feedbackService'
import { cartService } from '@/services/cartService'
import type { ReviewResponse, QuestionResponse } from '@/types/feedback'
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  Send,
  Upload,
  X
} from 'lucide-react'

/**
 * ProductDetailPage Component
 * 
 * Displays detailed information about a single product including:
 * - Product images with gallery navigation
 * - Product information (name, description, price, rating)
 * - Add to cart functionality with quantity selection
 * - Product features and specifications
 * - Loading and error states
 */
export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'questions'>('description')
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewImages, setReviewImages] = useState<File[]>([])
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  
  // Question form state
  const [questionText, setQuestionText] = useState('')
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)

  // Fetch product data
  const {
    data: product,
    isLoading,
    error,
    isError
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id!),
    enabled: !!id,
    retry: 2
  })

  // Fetch rating summary
  const {
    data: ratingSummary
  } = useQuery({
    queryKey: ['rating-summary', id],
    queryFn: () => feedbackService.getProductRatingSummary(id!),
    enabled: !!id && activeTab === 'reviews',
    retry: 1
  })

  // Fetch reviews
  const {
    data: reviewsData,
    isLoading: isReviewsLoading
  } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => feedbackService.getProductReviews(id!, 0, 5),
    enabled: !!id && activeTab === 'reviews',
    retry: 1
  })

  // Fetch questions
  const {
    data: questionsData,
    isLoading: isQuestionsLoading
  } = useQuery({
    queryKey: ['questions', id],
    queryFn: () => feedbackService.getProductQuestions(id!, 0, 5),
    enabled: !!id && activeTab === 'questions',
    retry: 1
  })

  // Sepete ekleme mutation'ı
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error('Ürün bulunamadı')
      return cartService.addToCart({ 
        productId: Number(product.id), 
        quantity 
      })
    },
    onSuccess: () => {
      // Cart query'lerini güncelle
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      
      // Başarı mesajı
      toast.success(`${product?.name} sepete eklendi (${quantity} adet)`)
      
      console.log('[ProductDetailPage] Ürün sepete eklendi:', {
        productId: product?.id,
        quantity
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Ürün sepete eklenirken hata oluştu'
      toast.error(errorMessage)
      console.error('[ProductDetailPage] Sepete ekleme hatası:', error)
    }
  })

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImageIndex(0)
    
    // Ürün görüntüleme etkileşimini kaydet
    if (product) {
      recommendationService.trackProductView(
        product.id.toString(),
        user?.id,
        user ? undefined : localStorage.getItem('guest_id') || undefined
      )
    }
  }, [product, user])

  const handleAddToCart = () => {
    if (!product) return
    
    // Sepete ekleme etkileşimini kaydet
    recommendationService.trackAddToCart(
      product.id.toString(),
      user?.id,
      user ? undefined : localStorage.getItem('guest_id') || undefined
    )
    
    // Gerçek sepet API'sini çağır
    addToCartMutation.mutate()
  }

  const incrementQuantity = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-5 h-5 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      )
    }

    return stars
  }

  // Review form handlers
  const handleSubmitReview = async () => {
    if (!user || !product) {
      toast.error('Yorum yapmak için giriş yapmanız gerekiyor')
      return
    }
    
    if (!reviewText.trim()) {
      toast.error('Lütfen yorum yazın')
      return
    }

    console.log('[ProductDetailPage] User info:', {
      isAuthenticated: !!user,
      userId: user?.id,
      userName: user?.firstName + ' ' + user?.lastName
    })

    setIsSubmittingReview(true)
    try {
      await feedbackService.addReview(
        {
          productId: String(product.id), // Convert to string for backend
          comment: reviewText.trim(),
          rating: reviewRating
        },
        reviewImages.length > 0 ? reviewImages : undefined
      )

      toast.success('Yorumunuz başarıyla gönderildi!')
      
      // Reset form
      setReviewText('')
      setReviewRating(5)
      setReviewImages([])
      setShowReviewForm(false)
      
      // Refresh reviews data
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
      queryClient.invalidateQueries({ queryKey: ['rating-summary', id] })
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Yorum gönderilirken hata oluştu')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Validate files
    const validation = FeedbackUtils.validateImageFiles(files)

    if (!validation.valid) {
      toast.error(validation.errors[0])
      return
    }

    setReviewImages(prev => [...prev, ...files].slice(0, 5)) // Max 5 images
  }

  const removeImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index))
  }

  // Question form handlers
  const handleSubmitQuestion = async () => {
    if (!user || !product) {
      toast.error('Soru sormak için giriş yapmanız gerekiyor')
      return
    }
    
    if (!questionText.trim()) {
      toast.error('Lütfen sorunuzu yazın')
      return
    }

    setIsSubmittingQuestion(true)
    try {
      await feedbackService.askQuestion({
        productId: String(product.id), // Convert to string for backend
        questionText: questionText.trim()
      })

      toast.success('Sorunuz başarıyla gönderildi!')
      
      // Reset form
      setQuestionText('')
      
      // Refresh questions data
      queryClient.invalidateQueries({ queryKey: ['questions', id] })
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Soru gönderilirken hata oluştu')
    } finally {
      setIsSubmittingQuestion(false)
    }
  }

  // Vote review handler
  const handleVoteReview = async (reviewId: string) => {
    try {
      await feedbackService.voteReview(reviewId)
      toast.success('Oyunuz kaydedildi!')
      
      // Refresh reviews data
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Oy verilirken hata oluştu')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Ürün detayları yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Ürün Bulunamadı</h1>
            <p className="text-muted-foreground mb-6">
              {error instanceof Error ? error.message : 'Aradığınız ürün mevcut değil.'}
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const productImages = ImageUtils.getProductImageUrls(product)
  const isOnSale = product.originalPrice && product.originalPrice > product.price

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate('/')} className="hover:text-primary">
            Ana Sayfa
          </button>
          <span>/</span>
          <span>{product.category?.name || 'Kategori'}</span>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => 
                      prev === 0 ? productImages.length - 1 : prev - 1
                    )}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => 
                      prev === productImages.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Sale Badge */}
              {isOnSale && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded">
                  Sale
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <span>{product.brand?.name || 'Marka'}</span>
                <span>•</span>
                <span>{product.category?.name || 'Kategori'}</span>
                <span>•</span>
                <span>ID: {product.id}</span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {renderStars(ratingSummary?.averageRating || product.rating)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {(ratingSummary?.averageRating || product.rating).toFixed(1)} 
                  ({ratingSummary?.totalReviews || product.reviewCount} değerlendirme)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold">
                  {product.currency} {product.price.toFixed(2)}
                </span>
                {isOnSale && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {product.currency} {product.originalPrice!.toFixed(2)}
                    </span>
                    <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                      {product.currency} {(product.originalPrice! - product.price).toFixed(2)} tasarruf
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Fiyat tüm vergileri içerir. 50 TL üzeri siparişlerde ücretsiz kargo.
              </p>
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              {product.inStock ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium">
                    Stokta ({product.stockQuantity} adet mevcut)
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm font-medium">Stok Tükendi</span>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              {product.inStock && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Adet:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stockQuantity}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Ekleniyor...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {product.inStock ? 'Sepete Ekle' : 'Stok Tükendi'}
                    </>
                  )}
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Etiketler:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping & Returns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Ücretsiz Kargo</p>
                  <p className="text-xs text-muted-foreground">50 TL üzeri siparişlerde</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Kolay İade</p>
                  <p className="text-xs text-muted-foreground">30 günlük iade politikası</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Güvenli Ödeme</p>
                  <p className="text-xs text-muted-foreground">SSL şifreli</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description and Reviews */}
        <div className="mt-16">
          <div className="border-b">
            <nav className="flex space-x-8">
              <button 
                onClick={() => setActiveTab('description')}
                className={`py-4 px-1 border-b-2 font-medium ${
                  activeTab === 'description' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Açıklama
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium ${
                  activeTab === 'reviews' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Değerlendirmeler ({ratingSummary?.totalReviews || product.reviewCount})
              </button>
              <button 
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-1 border-b-2 font-medium ${
                  activeTab === 'questions' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Sorular ({questionsData?.totalElements || 0})
              </button>
            </nav>
          </div>
          
          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Rating Summary */}
                {ratingSummary && (
                  <div className="bg-card border rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Overall Rating */}
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">
                          {ratingSummary.averageRating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center mb-2">
                          {renderStars(ratingSummary.averageRating)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ratingSummary.totalReviews} değerlendirme
                        </p>
                      </div>

                      {/* Rating Distribution */}
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(stars => {
                          const count = ratingSummary.starCounts[stars] || 0
                          const percentage = ratingSummary.totalReviews > 0 
                            ? (count / ratingSummary.totalReviews) * 100 
                            : 0
                          
                          return (
                            <div key={stars} className="flex items-center space-x-3">
                              <span className="text-sm w-8">{stars}</span>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-8">
                                {count}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                {isReviewsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Yorumlar yükleniyor...</span>
                  </div>
                ) : reviewsData?.content && reviewsData.content.length > 0 ? (
                  <div className="space-y-6">
                    {/* Write Review Button */}
                    {user && !showReviewForm && (
                      <div className="text-center">
                        <Button 
                          onClick={() => setShowReviewForm(true)}
                          variant="outline"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Yorum Yaz
                        </Button>
                      </div>
                    )}
                    
                    {!user && (
                      <div className="text-center">
                        <p className="text-muted-foreground mb-4">Yorum yapmak için giriş yapın</p>
                        <Button variant="outline" onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/keycloak'}>
                          Giriş Yap
                        </Button>
                      </div>
                    )}
                    
                    {reviewsData.content.map((review: ReviewResponse) => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {review.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium">{review.username}</span>
                              <div className="flex items-center">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                            <p className="text-muted-foreground mb-3">{review.comment}</p>
                            
                            {/* Review Images */}
                            {review.imageUrls && review.imageUrls.length > 0 && (
                              <div className="flex space-x-2 mb-3">
                                {review.imageUrls.map((imageUrl: string, index: number) => {
// 👇 DÜZELTME BURADA:
  // Eski Hatalı Hali: ... ? `http://localhost:8080/feedback-service${imageUrl}`
  
  // ✅ YENİ DOĞRU HALİ:
  // Gateway'de "/uploads" rotası tanımlı olduğu için direkt gateway'e atıyoruz.
  // "/feedback-service" öneki OLMAMALI.
                                  const fixedImageUrl = imageUrl.startsWith('/uploads/') 
                                  ? `http://localhost:8080${imageUrl}`
                                  : imageUrl;
                                  
                                  console.log('[ProductDetailPage] Fixed image URL:', imageUrl, '->', fixedImageUrl);
                                                                    
                                  return (
                                    <img
                                      key={index}
                                      src={fixedImageUrl}
                                      alt={`Review image ${index + 1}`}
                                      className="w-16 h-16 object-cover rounded border"
                                      onError={(e) => {
                                        console.error('[ProductDetailPage] Image load error:', fixedImageUrl, e)
                                      }}
                                      onLoad={() => {
                                        console.log('[ProductDetailPage] Image loaded successfully:', fixedImageUrl)
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            )}
                            
                            {/* Helpful Button */}
                            <button 
                              onClick={() => handleVoteReview(review.id)}
                              className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span>Faydalı ({review.helpfulCount})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {reviewsData.totalElements > 5 && (
                      <div className="text-center">
                        <Button variant="outline">
                          Tüm Yorumları Gör ({reviewsData.totalElements})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Henüz değerlendirme yapılmamış.</p>
                    {user ? (
                      <Button 
                        className="mt-4"
                        onClick={() => setShowReviewForm(true)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        İlk Yorumu Sen Yap
                      </Button>
                    ) : (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">İlk yorumu yapmak için giriş yapın</p>
                        <Button variant="outline" onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/keycloak'}>
                          Giriş Yap
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Form */}
                {user && showReviewForm && (
                  <div className="bg-card border rounded-lg p-6 mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Ürünü Değerlendir</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowReviewForm(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Rating Selection */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Puanınız</label>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewRating(star)}
                              className="p-1"
                            >
                              <Star 
                                className={`w-6 h-6 ${
                                  star <= reviewRating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({reviewRating}/5)
                          </span>
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Yorumunuz</label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
                          className="w-full p-3 border rounded-lg resize-none"
                          rows={4}
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Fotoğraflar (İsteğe bağlı)
                        </label>
                        <div className="space-y-3">
                          {/* Upload Button */}
                          <div className="flex items-center space-x-3">
                            <input
                              type="file"
                              id="review-images"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <label
                              htmlFor="review-images"
                              className="flex items-center space-x-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                            >
                              <Upload className="w-4 h-4" />
                              <span className="text-sm">Fotoğraf Ekle</span>
                            </label>
                            <span className="text-xs text-muted-foreground">
                              En fazla 5 fotoğraf (Max 5MB)
                            </span>
                          </div>

                          {/* Preview Images */}
                          {reviewImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {reviewImages.map((file, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                  <button
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex space-x-3">
                        <Button 
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview || !reviewText.trim()}
                          className="flex-1"
                        >
                          {isSubmittingReview ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Gönderiliyor...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Yorumu Gönder
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setShowReviewForm(false)}
                        >
                          İptal
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-6">
                {/* Ask Question Form */}
                {user ? (
                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Ürün Hakkında Soru Sor</h3>
                    <div className="space-y-4">
                      <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Sorunuzu buraya yazın..."
                        className="w-full p-3 border rounded-lg resize-none"
                        rows={3}
                      />
                      <Button 
                        onClick={handleSubmitQuestion}
                        disabled={isSubmittingQuestion || !questionText.trim()}
                      >
                        {isSubmittingQuestion ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Soru Gönder
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border rounded-lg p-6 text-center">
                    <h3 className="font-semibold mb-4">Ürün Hakkında Soru Sor</h3>
                    <p className="text-muted-foreground mb-4">Soru sormak için giriş yapmanız gerekiyor</p>
                    <Button onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/keycloak'}>
                      Giriş Yap
                    </Button>
                  </div>
                )}

                {/* Questions List */}
                {isQuestionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Sorular yükleniyor...</span>
                  </div>
                ) : questionsData?.content && questionsData.content.length > 0 ? (
                  <div className="space-y-6">
                    {questionsData.content.map((question: QuestionResponse) => (
                      <div key={question.id} className="border-b pb-6 last:border-b-0">
                        <div className="space-y-4">
                          {/* Question */}
                          <div className="flex items-start space-x-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium">{question.userFullName}</span>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(question.askDate).toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                              <p className="text-foreground">{question.questionText}</p>
                            </div>
                          </div>

                          {/* Answer */}
                          {question.answerText ? (
                            <div className="flex items-start space-x-4 ml-12">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-green-600">A</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-medium text-green-600">
                                    {question.answeredBy || 'Mağaza'}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {question.answerDate && new Date(question.answerDate).toLocaleDateString('tr-TR')}
                                  </span>
                                </div>
                                <p className="text-muted-foreground">{question.answerText}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="ml-12 text-sm text-muted-foreground">
                              Bu soru henüz cevaplanmamış.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {questionsData.totalElements > 5 && (
                      <div className="text-center">
                        <Button variant="outline">
                          Tüm Soruları Gör ({questionsData.totalElements})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Henüz soru sorulmamış.</p>
                    {user && (
                      <p className="text-sm text-muted-foreground mt-2">
                        İlk soruyu sen sor!
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Products Section */}
        <div className="mt-16">
          <SimilarProducts
            currentProductId={product.id.toString()}
            userId={user?.id}
            guestId={user ? undefined : localStorage.getItem('guest_id') || undefined}
            title="Benzer Ürünler"
            maxItems={6}
            className="mb-8"
          />
        </div>

        {/* Product Q&A Section */}
        <div className="mt-16">
          <ProductQA productId={product.id.toString()} />
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage