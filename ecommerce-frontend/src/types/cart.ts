/**
 * Sepet ile ilgili TypeScript arayüzleri ve türleri
 * Backend CartController DTO'larına uygun güncellenmiş tipler
 */

/**
 * Backend CartItemRequestDto'ya uygun sepete ekleme isteği
 */
export interface AddToCartRequest {
  /** Ürün ID'si (Backend Long bekliyor) */
  productId: number
  /** Miktar (Backend Integer bekliyor) */
  quantity: number
}

/**
 * Backend CartItem modeline uygun sepet öğesi
 */
export interface CartItem {
  /** Ürün ID'si */
  productId: number
  /** Ürün adı */
  productName: string
  /** Ürün slug'ı */
  productSlug: string
  /** Ürün resmi */
  imageUrl: string
  /** Miktar */
  quantity: number
  /** Birim fiyat (Backend BigDecimal -> number) */
  price: number
  /** Satır toplamı (quantity * price) */
  totalItemPrice: number
  /** Stokta var mı */
  inStock?: boolean
  /** Stok miktarı */
  stockQuantity?: number
}

/**
 * Backend Cart modeline uygun sepet
 */
export interface Cart {
  /** Kullanıcı ID'si (Keycloak ID veya "guest:uuid") */
  userId: string
  /** Sepet öğeleri */
  items: CartItem[]
  /** Tüm sepetin toplamı (Backend BigDecimal -> number) */
  totalCartPrice: number
  /** Computed: Toplam öğe sayısı */
  itemCount: number
  /** Computed: Toplam tutar (alias for totalCartPrice) */
  totalAmount: number
}

/**
 * UI için sepet özeti (hafif versiyon)
 */
export interface CartSummary {
  /** Toplam öğe sayısı */
  itemCount: number
  /** Toplam tutar */
  totalAmount: number
}

/**
 * Sepet durumu (UI için)
 */
export interface CartState {
  /** Mevcut sepet */
  cart: Cart | null
  /** Yükleme durumu */
  isLoading: boolean
  /** Hata durumu */
  error: string | null
  /** Sepet drawer açık mı */
  isCartOpen: boolean
  /** Son güncelleme zamanı */
  lastUpdated: number | null
}

/**
 * Sepet işlem türleri
 */
export type CartAction = 
  | 'ADD_ITEM'
  | 'REMOVE_ITEM'
  | 'CLEAR_CART'
  | 'MERGE_CART'
  | 'LOAD_CART'

/**
 * Sepet işlem sonucu
 */
export interface CartActionResult {
  /** İşlem başarılı mı */
  success: boolean
  /** Güncellenmiş sepet */
  cart?: Cart
  /** Hata mesajı */
  error?: string
  /** İşlem türü */
  action: CartAction
}

/**
 * Sepet birleştirme isteği
 */
export interface MergeCartRequest {
  /** Misafir sepet ID'si */
  guestId: string
}

/**
 * Sepet yardımcı fonksiyonları için tipler
 */
export interface CartUtils {
  calculateTotal: (items: CartItem[]) => number
  calculateItemCount: (items: CartItem[]) => number
  hasProduct: (items: CartItem[], productId: number) => boolean
  getProductQuantity: (items: CartItem[], productId: number) => number
  isEmpty: (cart: Cart | null) => boolean
  formatPrice: (amount: number) => string
}