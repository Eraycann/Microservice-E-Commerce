/**
 * Sepet Servisi
 * 
 * Backend CartController API'larına uygun sepet işlemleri:
 * - GET /api/v1/cart - Sepeti getir (X-Guest-Id header otomatik)
 * - POST /api/v1/cart/items - Ürün ekle (CartItemRequestDto)
 * - DELETE /api/v1/cart/items/{productId} - Ürün çıkar
 * - DELETE /api/v1/cart - Sepeti temizle
 * - POST /api/v1/cart/merge?guestId={id} - Sepetleri birleştir
 * - GET /api/v1/products/{id}/cart-detail - Ürün sepet detayı
 */

import { apiClient } from '@/lib/axios'
import type { Cart, AddToCartRequest } from '@/types/cart'

interface ProductCartDetail {
  id: number
  name: string
  slug: string
  price: number
  imageUrl: string
  inStock: boolean
  stockQuantity: number
}

export class CartService {
  private static instance: CartService
  private readonly baseUrl = '/api/v1/cart'

  private constructor() {}

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService()
    }
    return CartService.instance
  }

  /**
   * Sepeti getir ve ürün detaylarını zenginleştir
   * Backend: GET /api/v1/cart (X-Guest-Id header otomatik eklenir)
   * Sonrasında her ürün için detay bilgilerini çeker
   */
  async getCart(): Promise<Cart> {
    console.log('[CartService] Sepet getiriliyor...')
    const response = await apiClient.get<Cart>(this.baseUrl)
    const cart = response.data
    
    console.log('[CartService] Ham sepet verisi:', cart)
    
    // Sepet boşsa direkt döndür
    if (!cart || !cart.items || cart.items.length === 0) {
      console.log('[CartService] Sepet boş, direkt döndürülüyor')
      return cart
    }

    console.log('[CartService] Ürün detayları zenginleştiriliyor...', cart.items.length, 'ürün')

    // Her ürün için detay bilgilerini çek ve zenginleştir
    const enrichedItems = await Promise.allSettled(
      cart.items.map(async (item, index) => {
        try {
          console.log(`[CartService] Ürün ${index + 1}/${cart.items.length} detayı getiriliyor: ${item.productId}`)
          const productDetail = await this.getProductCartDetail(item.productId)
          console.log(`[CartService] Ürün ${item.productId} detayı alındı:`, productDetail)
          
          const enrichedItem = {
            ...item,
            productName: productDetail.name || item.productName,
            productSlug: productDetail.slug || item.productSlug,
            imageUrl: productDetail.imageUrl || item.imageUrl || '/placeholder-product.svg',
            price: productDetail.price || item.price,
            // Stok bilgilerini de ekle
            inStock: productDetail.inStock ?? true,
            stockQuantity: productDetail.stockQuantity ?? 0
          }
          
          console.log(`[CartService] Zenginleştirilmiş ürün ${item.productId}:`, enrichedItem)
          return enrichedItem
        } catch (error) {
          console.warn(`[CartService] Ürün detayı alınamadı: ${item.productId}`, error)
          // Hata durumunda mevcut item'ı döndür ama placeholder resim ekle
          return {
            ...item,
            imageUrl: item.imageUrl || '/placeholder-product.svg',
            inStock: true,
            stockQuantity: 0
          }
        }
      })
    )

    // Başarılı olanları al, başarısızları fallback ile kullan
    const finalItems = enrichedItems.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.warn(`[CartService] Ürün ${cart.items[index].productId} için fallback kullanılıyor`)
        return {
          ...cart.items[index],
          imageUrl: cart.items[index].imageUrl || '/placeholder-product.svg',
          inStock: true,
          stockQuantity: 0
        }
      }
    })

    const finalCart = {
      ...cart,
      items: finalItems
    }
    
    console.log('[CartService] Final sepet verisi:', finalCart)
    return finalCart
  }

  /**
   * Ürün sepet detayını getir
   * Backend: GET /api/v1/products/{id}/cart-detail
   */
  private async getProductCartDetail(productId: number): Promise<ProductCartDetail> {
    console.log(`[CartService] Ürün detayı isteniyor: /api/v1/products/${productId}/cart-detail`)
    const response = await apiClient.get<ProductCartDetail>(`/api/v1/products/${productId}/cart-detail`)
    console.log(`[CartService] Ürün ${productId} detay yanıtı:`, response.data)
    return response.data
  }

  /**
   * Sepete ürün ekle
   * Backend: POST /api/v1/cart/items (X-Guest-Id header otomatik eklenir)
   * Body: { productId: Long, quantity: Integer }
   */
  async addToCart(request: AddToCartRequest): Promise<Cart> {
    const response = await apiClient.post<Cart>(`${this.baseUrl}/items`, {
      productId: request.productId,
      quantity: request.quantity
    })
    return response.data
  }

  /**
   * Sepetten ürün çıkar
   * Backend: DELETE /api/v1/cart/items/{productId}
   */
  async removeFromCart(productId: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/items/${productId}`)
  }

  /**
   * Sepet öğesi miktarını güncelle
   * Backend: Bu endpoint yoksa, önce sil sonra ekle mantığı kullanılır
   */
  async updateCartItem(productId: number, quantity: number): Promise<Cart> {
    // Backend'de update endpoint'i yoksa, önce sil sonra ekle
    if (quantity <= 0) {
      await this.removeFromCart(productId)
      return this.getCart()
    }
    
    // Mevcut ürünü sil ve yeni miktarla ekle
    try {
      await this.removeFromCart(productId)
      return await this.addToCart({ productId, quantity })
    } catch (error) {
      // Silme başarısızsa (ürün zaten yoksa), sadece ekle
      return await this.addToCart({ productId, quantity })
    }
  }

  /**
   * Sepeti temizle
   * Backend: DELETE /api/v1/cart
   */
  async clearCart(): Promise<void> {
    await apiClient.delete(this.baseUrl)
  }

  /**
   * Sepetleri birleştir (giriş sonrası)
   * Backend: POST /api/v1/cart/merge?guestId={guestId}
   */
  async mergeCarts(guestId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/merge`, null, {
      params: { guestId }
    })
  }
}

// Singleton instance'ı export et
export const cartService = CartService.getInstance()