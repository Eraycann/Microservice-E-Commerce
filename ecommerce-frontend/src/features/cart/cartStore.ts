import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * Cart store state interface
 * 
 * Note: This store manages client-side cart UI state only.
 * Actual cart data is managed by TanStack Query and the backend.
 */
interface CartStore {
  // UI State
  itemCount: number
  isCartOpen: boolean
  isLoading: boolean

  // Actions
  setItemCount: (count: number) => void
  incrementItemCount: (amount?: number) => void
  decrementItemCount: (amount?: number) => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  setLoading: (loading: boolean) => void
  resetCart: () => void
}

/**
 * Cart store using Zustand
 * 
 * Features:
 * - Manages cart drawer open/close state
 * - Tracks item count for UI badge display
 * - Provides loading states for cart operations
 * - DevTools integration for debugging
 * 
 * Note: This is for UI state only. Actual cart data comes from the server
 * and is managed by TanStack Query in the cart service.
 */
export const useCartStore = create<CartStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      itemCount: 0,
      isCartOpen: false,
      isLoading: false,

      // Actions
      setItemCount: (count: number) => {
        set(
          { itemCount: Math.max(0, count) },
          false,
          'cart/setItemCount'
        )
        console.log('[Cart Store] Item count updated:', count)
      },

      incrementItemCount: (amount = 1) => {
        const { itemCount } = get()
        const newCount = itemCount + amount
        
        set(
          { itemCount: newCount },
          false,
          'cart/incrementItemCount'
        )
        console.log('[Cart Store] Item count incremented by', amount, 'to', newCount)
      },

      decrementItemCount: (amount = 1) => {
        const { itemCount } = get()
        const newCount = Math.max(0, itemCount - amount)
        
        set(
          { itemCount: newCount },
          false,
          'cart/decrementItemCount'
        )
        console.log('[Cart Store] Item count decremented by', amount, 'to', newCount)
      },

      openCart: () => {
        set(
          { isCartOpen: true },
          false,
          'cart/openCart'
        )
        console.log('[Cart Store] Cart drawer opened')
      },

      closeCart: () => {
        set(
          { isCartOpen: false },
          false,
          'cart/closeCart'
        )
        console.log('[Cart Store] Cart drawer closed')
      },

      toggleCart: () => {
        const { isCartOpen } = get()
        const newState = !isCartOpen
        
        set(
          { isCartOpen: newState },
          false,
          'cart/toggleCart'
        )
        console.log('[Cart Store] Cart drawer toggled to:', newState ? 'open' : 'closed')
      },

      setLoading: (loading: boolean) => {
        set(
          { isLoading: loading },
          false,
          'cart/setLoading'
        )
      },

      resetCart: () => {
        set(
          {
            itemCount: 0,
            isCartOpen: false,
            isLoading: false,
          },
          false,
          'cart/resetCart'
        )
        console.log('[Cart Store] Cart state reset')
      },
    }),
    {
      name: 'cart-store', // DevTools name
    }
  )
)

/**
 * Selector hooks for common cart state patterns
 */
export const useCartUI = () => {
  const { itemCount, isCartOpen, isLoading } = useCartStore()
  return { itemCount, isCartOpen, isLoading }
}

export const useCartActions = () => {
  const { 
    setItemCount, 
    incrementItemCount, 
    decrementItemCount, 
    openCart, 
    closeCart, 
    toggleCart, 
    setLoading, 
    resetCart 
  } = useCartStore()
  
  return { 
    setItemCount, 
    incrementItemCount, 
    decrementItemCount, 
    openCart, 
    closeCart, 
    toggleCart, 
    setLoading, 
    resetCart 
  }
}