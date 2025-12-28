/**
 * CartIcon Bileşeni
 * 
 * Navbar'da görüntülenen sepet ikonu ve öğe sayısı rozeti.
 * Sepet drawer'ını açmak için kullanılır.
 */

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { cartService } from '@/services/cartService'
import { useCartActions, useCartUI } from '@/features/cart/cartStore'
import { ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CartIconProps {
  /** Buton varyantı */
  variant?: 'default' | 'outline' | 'ghost'
  /** Buton boyutu */
  size?: 'sm' | 'default' | 'lg'
  /** Rozet gösterilsin mi */
  showBadge?: boolean
  /** Özel CSS sınıfları */
  className?: string
  /** Tıklama callback'i */
  onClick?: () => void
}

export const CartIcon: React.FC<CartIconProps> = ({
  variant = 'ghost',
  size = 'default',
  showBadge = true,
  className,
  onClick
}) => {
  const { toggleCart } = useCartActions()

  // Sepet verilerini getir
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 30, // 30 saniye
    refetchOnWindowFocus: false,
    retry: 1
  })

  // Sepet öğe sayısını hesapla
  const currentItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0

  // Tıklama işleyicisi
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      toggleCart()
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn('relative hover:bg-primary/10 transition-colors', className)}
      disabled={isLoading}
    >
      <ShoppingCart className="h-5 w-5" />
      
      {/* Öğe Sayısı Rozeti */}
      {showBadge && currentItemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[1.25rem] px-1 shadow-lg animate-pulse">
          {currentItemCount > 99 ? '99+' : currentItemCount}
        </span>
      )}
      
      {/* Yükleme Göstergesi */}
      {isLoading && (
        <span className="absolute -top-1 -right-1 bg-muted-foreground rounded-full h-2 w-2 animate-pulse" />
      )}
    </Button>
  )
}

/**
 * Kompakt sepet ikonu (sadece ikon, rozet yok)
 */
export const CompactCartIcon: React.FC<Omit<CartIconProps, 'showBadge'>> = (props) => {
  return <CartIcon {...props} showBadge={false} />
}

/**
 * Sepet ikonu ile metin
 */
interface CartIconWithTextProps extends CartIconProps {
  /** Gösterilecek metin */
  text?: string
  /** Metin pozisyonu */
  textPosition?: 'left' | 'right'
}

export const CartIconWithText: React.FC<CartIconWithTextProps> = ({
  text = 'Sepet',
  textPosition = 'right',
  className,
  ...props
}) => {
  const { itemCount } = useCartUI()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {textPosition === 'left' && (
        <span className="text-sm font-medium">
          {text} {itemCount > 0 && `(${itemCount})`}
        </span>
      )}
      
      <CartIcon {...props} />
      
      {textPosition === 'right' && (
        <span className="text-sm font-medium">
          {text} {itemCount > 0 && `(${itemCount})`}
        </span>
      )}
    </div>
  )
}