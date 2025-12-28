import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

/**
 * NotFoundPage Component
 * 
 * 404 error page displayed when users navigate to non-existent routes.
 * Provides helpful navigation options to get users back on track.
 */
export const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Search className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Sayfa Bulunamadı</h1>
          <p className="text-muted-foreground text-lg mb-2">
            Üzgünüz! Aradığınız sayfa mevcut değil.
          </p>
          <p className="text-muted-foreground">
            Sayfa taşınmış, silinmiş olabilir veya yanlış URL girmiş olabilirsiniz.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="w-5 h-5 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Geri Dön
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Belirli bir şey mi arıyorsunuz? Bu popüler sayfaları deneyin:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/products" 
              className="text-sm text-primary hover:underline"
            >
              Tüm Ürünler
            </Link>
            <Link 
              to="/categories" 
              className="text-sm text-primary hover:underline"
            >
              Kategoriler
            </Link>
            <Link 
              to="/cart" 
              className="text-sm text-primary hover:underline"
            >
              Alışveriş Sepeti
            </Link>
            <Link 
              to="/profile" 
              className="text-sm text-primary hover:underline"
            >
              Hesabım
            </Link>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Hala aradığınızı bulamıyor musunuz?{' '}
            <Link to="/contact" className="text-primary hover:underline">
              Destek ekibimizle iletişime geçin
            </Link>{' '}
            yardım için.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage