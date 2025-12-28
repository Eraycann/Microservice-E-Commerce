/**
 * Sepet yardımcı fonksiyonları
 */

import type { Cart, CartItem } from '@/types/cart'

class CartUtils {
  /**
   * Fiyat formatla
   */
  static formatPrice(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  /**
   * Sepet boş mu kontrol et
   */
  static isEmpty(cart: Cart | null): boolean {
    return !cart || !cart.items || cart.items.length === 0
  }

  /**
   * Toplam öğe sayısını hesapla
   */
  static calculateItemCount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  /**
   * Toplam tutarı hesapla
   */
  static calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.totalItemPrice, 0)
  }

  /**
   * Sepet özetini getir
   */
  static getSummary(cart: Cart) {
    const itemCount = this.calculateItemCount(cart.items)
    const subtotal = cart.totalCartPrice
    const shipping = subtotal >= 500 ? 0 : 29.99 // 500 TL üzeri ücretsiz kargo
    const tax = subtotal * 0.18 // %18 KDV
    const totalAmount = subtotal + shipping + tax

    return {
      itemCount,
      subtotal,
      shipping,
      tax,
      totalAmount
    }
  }

  /**
   * Ürünün sepette olup olmadığını kontrol et
   */
  static hasProduct(items: CartItem[], productId: number): boolean {
    return items.some(item => item.productId === productId)
  }

  /**
   * Ürünün sepetteki miktarını getir
   */
  static getProductQuantity(items: CartItem[], productId: number): number {
    const item = items.find(item => item.productId === productId)
    return item ? item.quantity : 0
  }

  /**
   * Sepet öğesini zenginleştir (eski API uyumluluğu için)
   */
  static enrichCartItem(item: CartItem) {
    return {
      product: {
        id: item.productId,
        name: item.productName,
        slug: item.productSlug,
        price: item.price,
        imageUrl: item.imageUrl,
        imageUrls: [item.imageUrl],
        description: '', // Backend'den gelmiyor
        brand: { name: '' }, // Backend'den gelmiyor
        inStock: item.inStock ?? true,
        stockQuantity: item.stockQuantity ?? 0
      },
      quantity: item.quantity,
      totalPrice: item.totalItemPrice
    }
  }
}

export default CartUtils