/**
 * useCartMerge Hook
 * 
 * Kullanıcı giriş yaptığında misafir sepetini kullanıcı sepetiyle birleştirme işlemini yönetir.
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/authStore'
import { cartService } from '@/services/cartService'

export const useCartMerge = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    // Kullanıcı giriş yaptığında sepet birleştirme işlemini başlat
    if (isAuthenticated && user) {
      handleCartMerge()
    }
  }, [isAuthenticated, user])

  const handleCartMerge = async () => {
    try {
      // LocalStorage'dan guest_id'yi kontrol et
      const guestId = localStorage.getItem('guest_id')
      
      if (!guestId) {
        console.log('[Cart Merge] No guest cart to merge')
        return
      }

      console.log('[Cart Merge] Starting cart merge for guest:', guestId)

      // Sepet birleştirme API çağrısı
      await cartService.mergeCarts(guestId)
      
      // Guest ID'yi temizle
      localStorage.removeItem('guest_id')
      
      // Query cache'i geçersizleştir
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      
      console.log('[Cart Merge] Cart merge successful')

    } catch (error) {
      console.error('[Cart Merge] Cart merge failed:', error)
      
      // Hata durumunda guest_id'yi silmiyoruz, kullanıcı manuel olarak sepetini yönetebilir
      // veya daha sonra tekrar deneyebilir
    }
  }

  return { handleCartMerge }
}