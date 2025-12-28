/**
 * Checkout ile ilgili TypeScript tipleri
 * Backend OrderController ve CreateOrderRequest'e uygun
 */

import type { Address } from './user'

/**
 * Sipariş oluşturma isteği
 * Backend CreateOrderRequest'e uygun
 */
export interface CreateOrderRequest {
  /** Teslimat adresi (string formatında) */
  shippingAddress: string
}

/**
 * Sipariş yanıtı
 * Backend OrderResponse'a uygun
 */
export interface OrderResponse {
  /** Sipariş numarası */
  orderNumber: string
  /** Kullanıcı ID'si */
  userId: string
  /** Kullanıcı email'i */
  userEmail: string
  /** Kullanıcı tam adı */
  userFullName: string
  /** Teslimat adresi */
  shippingAddress: Address
  /** Sipariş öğeleri */
  items: OrderItem[]
  /** Toplam tutar */
  totalAmount: number
  /** Sipariş durumu */
  status: OrderStatus
  /** Oluşturulma tarihi */
  createdAt: string
}

/**
 * Sipariş öğesi
 */
export interface OrderItem {
  /** Ürün ID'si */
  productId: number
  /** Ürün adı */
  productName: string
  /** Ürün resmi */
  imageUrl: string
  /** Miktar */
  quantity: number
  /** Birim fiyat */
  unitPrice: number
  /** Toplam fiyat */
  totalPrice: number
}

/**
 * Sipariş durumu
 */
export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

/**
 * Checkout durumu
 */
export interface CheckoutState {
  /** Seçili teslimat adresi */
  selectedAddress: Address | null
  /** Yükleme durumu */
  isLoading: boolean
  /** Hata durumu */
  error: string | null
  /** Sipariş oluşturma durumu */
  isPlacingOrder: boolean
}

/**
 * Checkout adımları
 */
export type CheckoutStep = 
  | 'address'
  | 'payment'
  | 'review'
  | 'complete'

/**
 * Checkout özeti
 */
export interface CheckoutSummary {
  /** Ürün sayısı */
  itemCount: number
  /** Alt toplam */
  subtotal: number
  /** Kargo ücreti */
  shippingCost: number
  /** Vergi */
  tax: number
  /** Genel toplam */
  total: number
}