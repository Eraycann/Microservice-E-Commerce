import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/product'
import { RecommendedProducts } from '@/components/recommendation/RecommendedProducts'
import { TopBrands } from '@/components/search/TopBrands'
import { TopCategories } from '@/components/search/TopCategories'
import { useAuth, useAuthActions } from '@/features/auth'
import { searchService } from '@/services/searchService'
import { 
  ShoppingBag, 
  Star, 
  TrendingUp, 
  Users, 
  Shield,
  Truck,
  RotateCcw,
  ArrowRight
} from 'lucide-react'

/**
 * HomePage Component
 * 
 * The main landing page of the e-commerce application.
 * Features:
 * - Hero section with call-to-action
 * - Featured products showcase using ProductGrid
 * - Statistics section
 * - Authentication-aware content
 * - Service highlights
 */
export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const { checkAuth } = useAuthActions()
  const navigate = useNavigate()

  // Check authentication on page load
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Fetch featured products from SearchService
  const {
    data: featuredProductsRaw = [],
    isLoading: featuredLoading,
    error: featuredError
  } = useQuery({
    queryKey: ['search', 'featured'],
    queryFn: () => searchService.getFeaturedProducts(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Convert ProductIndex to Product format for ProductGrid compatibility
  const featuredProducts = featuredProductsRaw.map(productIndex => 
    searchService.convertToProduct(productIndex)
  )

  // Fetch bestseller products from SearchService
  const {
    data: bestsellerProductsRaw = [],
    isLoading: bestsellersLoading,
    error: bestsellersError
  } = useQuery({
    queryKey: ['search', 'bestsellers'],
    queryFn: () => searchService.getBestSellers(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Convert ProductIndex to Product format for ProductGrid compatibility
  const bestsellerProducts = bestsellerProductsRaw.map(productIndex => 
    searchService.convertToProduct(productIndex)
  )

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            E-Ticaret Mağazamıza Hoş Geldiniz
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Harika ürünleri keşfedin, sorunsuz alışveriş yapın ve modern 
            e-ticaret platformumuzla olağanüstü hizmet deneyimi yaşayın.
          </p>
          
          {isAuthenticated && user ? (
            <div className="space-y-4">
              <p className="text-lg">
                Tekrar hoş geldiniz, <span className="font-semibold text-primary">{user.firstName}</span>!
              </p>
              <Button size="lg" className="mr-4">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Alışverişe Devam Et
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Kişiselleştirilmiş önerilere ve hızlı ödemeye erişmek için giriş yapın
              </p>
              <Button size="lg">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Alışverişe Başla
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Personalized Recommendations Section - Only for authenticated users */}
      {isAuthenticated && user && (
        <section className="container mx-auto px-4">
          <RecommendedProducts
            userId={user.id}
            title="Sizin İçin Önerilenler"
            maxItems={8}
            showTitle={true}
            className="mb-8"
          />
        </section>
      )}

      {/* Featured Products Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Vitrin Ürünleri</h2>
          <p className="text-muted-foreground">
            En popüler ve trend ürünlerimizden özenle seçilmiş koleksiyonumuzu keşfedin
          </p>
        </div>

        <ProductGrid
          products={featuredProducts}
          loading={featuredLoading}
          error={featuredError?.message || null}
          emptyMessage="Şu anda vitrin ürünü bulunmuyor"
          variant="featured"
          columns={{ sm: 1, md: 2, lg: 3, xl: 3 }}
          className="mb-8"
        />

        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => navigate('/products')}>
            Tüm Ürünleri Görüntüle
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Çok Satanlar</h2>
          <p className="text-muted-foreground">
            Müşterilerimizin en çok tercih ettiği ve beğendiği ürünler
          </p>
        </div>

        <ProductGrid
          products={bestsellerProducts}
          loading={bestsellersLoading}
          error={bestsellersError?.message || null}
          emptyMessage="Şu anda çok satan ürün bulunmuyor"
          variant="default"
          columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
          className="mb-8"
        />

        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => navigate('/search?sort=bestsellers')}>
            Daha Fazla Çok Satan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Top Categories Section */}
      <section className="container mx-auto px-4">
        <TopCategories
          title="Popüler Kategoriler"
          maxCategories={8}
          showTitle={true}
          className="mb-8"
        />
      </section>

      {/* Top Brands Section */}
      <section className="container mx-auto px-4">
        <TopBrands
          title="Popüler Markalar"
          maxBrands={8}
          showTitle={true}
          className="mb-8"
        />
      </section>

      {/* Statistics Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">10K+</h3>
              <p className="text-muted-foreground">Mutlu Müşteri</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">5K+</h3>
              <p className="text-muted-foreground">Ürün</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">4.8</h3>
              <p className="text-muted-foreground">Ortalama Puan</p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">99%</h3>
              <p className="text-muted-foreground">Memnuniyet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Neden Bizi Seçmelisiniz?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Mümkün olan en iyi alışveriş deneyimini sunmaya kararlıyız
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-card rounded-lg border shadow-sm">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ücretsiz Kargo</h3>
            <p className="text-muted-foreground">
              50 TL üzeri tüm siparişlerde ücretsiz kargo. Hızlı ve güvenilir teslimat.
            </p>
          </div>

          <div className="text-center p-6 bg-card rounded-lg border shadow-sm">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Kolay İade</h3>
            <p className="text-muted-foreground">
              Memnun kalmadınız mı? 30 gün içinde herhangi bir ürünü sorunsuz iade edebilirsiniz.
            </p>
          </div>

          <div className="text-center p-6 bg-card rounded-lg border shadow-sm">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Güvenli Ödeme</h3>
            <p className="text-muted-foreground">
              Ödeme bilgileriniz endüstri standardı SSL şifreleme ile korunmaktadır.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-4 text-center">
        <div className="bg-primary rounded-2xl p-12 text-primary-foreground">
          <TrendingUp className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Alışverişe Başlamaya Hazır mısınız?</h2>
          <p className="mb-8 max-w-2xl mx-auto opacity-90">
            Binlerce memnun müşterimize katılın ve hızlı kargo ile mükemmel 
            müşteri hizmetiyle harika ürünleri keşfedin.
          </p>
          <Button size="lg" variant="secondary">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Ürünlere Göz At
          </Button>
        </div>
      </section>
    </div>
  )
}

export default HomePage