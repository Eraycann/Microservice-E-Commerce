/**
 * useCartSync Hook
 * 
 * Sepet durumunu farklı tarayıcı sekmeleri arasında senkronize eder
 * ve localStorage değişikliklerini dinler.
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCartActions } from '@/features/cart/cartStore'
import { cartService } from '@/services/cartService'

export const useCartSync = () => {
  const queryClient = useQueryClient()
  const { setItemCount } = useCartActions()

  useEffect(() => {
    // Storage event listener - diğer sekmelerden gelen değişiklikleri dinle
    const handleStorageChange = (event: StorageEvent) => {
      // Guest ID değişikliklerini dinle
      if (event.key === 'guest_id') {
        console.log('[Cart Sync] Guest ID changed in another tab')
        
        // Cart query'lerini yenile
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] })
      }

      // Auth durumu değişikliklerini dinle
      if (event.key === 'auth-store') {
        console.log('[Cart Sync] Auth state changed in another tab')
        
        // Kısa bir gecikme ile cart'ı yenile (auth değişikliği sonrası)
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['cart'] })
          queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] })
        }, 500)
      }
    }

    // Visibility change listener - sekme aktif olduğunda sepeti yenile
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[Cart Sync] Tab became visible, refreshing cart')
        
        // Sepet özetini yenile
        queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] })
      }
    }

    // Focus listener - pencere odaklandığında sepeti yenile
    const handleWindowFocus = () => {
      console.log('[Cart Sync] Window focused, refreshing cart')
      
      // Sepet özetini yenile
      queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] })
    }

    // Event listener'ları ekle
    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleWindowFocus)

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [queryClient, setItemCount])

  // Sepet durumunu periyodik olarak senkronize et
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        // Sadece aktif sekmede çalıştır
        if (document.hidden) return

        // Sepet verilerini al ve store'u güncelle
        const cart = await cartService.getCart()
        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
        setItemCount(itemCount)
        
      } catch (error) {
        // Sessizce hata yakala, kullanıcı deneyimini bozma
        console.debug('[Cart Sync] Periodic sync failed:', error)
      }
    }, 30000) // 30 saniyede bir

    return () => clearInterval(syncInterval)
  }, [setItemCount])
}

/**
 * Sepet kalıcılığı için localStorage yardımcıları
 */
export const CartPersistence = {
  /**
   * Misafir sepet ID'sini kaydet
   */
  saveGuestId: (guestId: string) => {
    try {
      localStorage.setItem('guest_id', guestId)
      console.log('[Cart Persistence] Guest ID saved:', guestId)
    } catch (error) {
      console.warn('[Cart Persistence] Failed to save guest ID:', error)
    }
  },

  /**
   * Misafir sepet ID'sini al
   */
  getGuestId: (): string | null => {
    try {
      return localStorage.getItem('guest_id')
    } catch (error) {
      console.warn('[Cart Persistence] Failed to get guest ID:', error)
      return null
    }
  },

  /**
   * Misafir sepet ID'sini temizle
   */
  clearGuestId: () => {
    try {
      localStorage.removeItem('guest_id')
      console.log('[Cart Persistence] Guest ID cleared')
    } catch (error) {
      console.warn('[Cart Persistence] Failed to clear guest ID:', error)
    }
  },

  /**
   * Sepet son güncelleme zamanını kaydet
   */
  saveLastUpdate: (timestamp: number = Date.now()) => {
    try {
      localStorage.setItem('cart_last_update', timestamp.toString())
    } catch (error) {
      console.warn('[Cart Persistence] Failed to save last update:', error)
    }
  },

  /**
   * Sepet son güncelleme zamanını al
   */
  getLastUpdate: (): number | null => {
    try {
      const timestamp = localStorage.getItem('cart_last_update')
      return timestamp ? parseInt(timestamp, 10) : null
    } catch (error) {
      console.warn('[Cart Persistence] Failed to get last update:', error)
      return null
    }
  }
}