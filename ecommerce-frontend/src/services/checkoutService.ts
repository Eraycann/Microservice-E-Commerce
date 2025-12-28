/**
 * Checkout Servisi
 * 
 * Backend OrderController API'larına uygun checkout işlemleri:
 * - POST /api/v1/orders - Sipariş oluştur
 * - GET /api/v1/orders - Kullanıcı siparişlerini getir
 */

import { apiClient } from '@/lib/axios'
import type { CreateOrderRequest, OrderResponse } from '@/types/checkout'
import type { Address } from '@/types/user'

export class CheckoutService {
  private static instance: CheckoutService
  private readonly baseUrl = '/api/v1/orders'

  private constructor() {}

  public static getInstance(): CheckoutService {
    if (!CheckoutService.instance) {
      CheckoutService.instance = new CheckoutService()
    }
    return CheckoutService.instance
  }

  /**
   * Sipariş oluştur
   * Backend: POST /api/v1/orders
   * JWT'den kullanıcı bilgileri otomatik alınır
   */
  async placeOrder(shippingAddress: Address): Promise<OrderResponse> {
    console.log('[CheckoutService] Sipariş oluşturuluyor...', shippingAddress)
    
    // Backend string formatında adres bekliyor, Address objesini string'e çevir
    const addressString = this.formatAddressAsString(shippingAddress)
    
    const request: CreateOrderRequest = {
      shippingAddress: addressString
    }

    console.log('[CheckoutService] Sipariş isteği:', request)
    const response = await apiClient.post<OrderResponse>(this.baseUrl, request)
    console.log('[CheckoutService] Sipariş yanıtı:', response.data)
    
    return response.data
  }

  /**
   * Address objesini backend'in beklediği string formatına çevir
   */
  private formatAddressAsString(address: Address): string {
    const parts = [
      address.title,
      address.fullAddress,
      address.district,
      address.city,
      address.zipCode
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  /**
   * Kullanıcı siparişlerini getir
   * Backend: GET /api/v1/orders?page=0&size=10
   */
  async getUserOrders(page: number = 0, size: number = 10): Promise<{
    content: OrderResponse[]
    totalElements: number
    totalPages: number
    number: number
    size: number
  }> {
    const response = await apiClient.get(this.baseUrl, {
      params: { page, size }
    })
    return response.data
  }

  /**
   * Checkout özeti hesapla
   * Frontend'de hesaplanan değerler
   */
  calculateCheckoutSummary(itemCount: number, subtotal: number) {
    const shippingCost = subtotal >= 500 ? 0 : 29.99 // 500 TL üzeri ücretsiz kargo
    const tax = subtotal * 0.18 // %18 KDV
    const total = subtotal + shippingCost + tax

    return {
      itemCount,
      subtotal,
      shippingCost,
      tax,
      total
    }
  }
}

// Singleton instance'ı export et
export const checkoutService = CheckoutService.getInstance()