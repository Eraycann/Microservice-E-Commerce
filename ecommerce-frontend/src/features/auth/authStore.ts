import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { User } from '@/types/user'
import { updateAuthState } from '@/lib/axios'
import AuthService from '@/services/authService'

/**
 * Authentication store state interface
 */
interface AuthStore {
  // State
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  error: string | null

  // Actions
  login: (user: User) => void
  logout: () => void
  checkAuth: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

/**
 * Authentication store using Zustand
 * 
 * Features:
 * - Persists authentication state to localStorage
 * - Integrates with API client for guest/auth state management
 * - Provides loading and error states
 * - DevTools integration for debugging
 */
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,

        // Actions
        login: (user: User) => {
          set(
            {
              isAuthenticated: true,
              user,
              error: null,
            },
            false,
            'auth/login'
          )

          // Update API client authentication state
          updateAuthState(true)

          console.log('[Auth Store] User logged in:', user.email)
        },

        logout: () => {
          set(
            {
              isAuthenticated: false,
              user: null,
              error: null,
            },
            false,
            'auth/logout'
          )

          // Update API client authentication state
          updateAuthState(false)

          console.log('[Auth Store] User logged out')
        },

        checkAuth: async () => {
          const { isLoading } = get()
          
          // Prevent multiple simultaneous auth checks
          if (isLoading) return

          set({ isLoading: true, error: null }, false, 'auth/checkAuth/start')

          try {
            // Use real auth service to check authentication
            const user = await AuthService.checkAuthStatus()
            
            if (user) {
              // User is authenticated
              set(
                {
                  isAuthenticated: true,
                  user,
                  isLoading: false,
                  error: null,
                },
                false,
                'auth/checkAuth/success'
              )

              // Update API client
              updateAuthState(true)
              
              console.log('[Auth Store] Auth check: User authenticated:', user.email)
            } else {
              // User is not authenticated
              set(
                {
                  isAuthenticated: false,
                  user: null,
                  isLoading: false,
                  error: null,
                },
                false,
                'auth/checkAuth/not_authenticated'
              )

              // Update API client
              updateAuthState(false)
              
              console.log('[Auth Store] Auth check: User not authenticated')
            }
          } catch (error) {
            console.error('[Auth Store] Auth check failed:', error)
            
            // Clear authentication state on error
            set(
              {
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: 'Authentication check failed',
              },
              false,
              'auth/checkAuth/error'
            )

            // Update API client
            updateAuthState(false)
          }
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, 'auth/setLoading')
        },

        setError: (error: string | null) => {
          set({ error }, false, 'auth/setError')
        },

        clearError: () => {
          set({ error: null }, false, 'auth/clearError')
        },
      }),
      {
        name: 'auth-store', // localStorage key
        partialize: (state) => ({
          // Only persist essential auth state
          isAuthenticated: state.isAuthenticated,
          user: state.user,
        }),
        onRehydrateStorage: () => (state) => {
          // Update API client auth state after rehydration
          if (state?.isAuthenticated) {
            updateAuthState(true)
            console.log('[Auth Store] Rehydrated authenticated user:', state.user?.email)
          } else {
            updateAuthState(false)
            console.log('[Auth Store] Rehydrated as guest user')
          }
        },
      }
    ),
    {
      name: 'auth-store', // DevTools name
    }
  )
)

/**
 * Selector hooks for common auth state patterns
 */
export const useAuth = () => {
  const { isAuthenticated, user, isLoading, error } = useAuthStore()
  return { isAuthenticated, user, isLoading, error }
}

export const useAuthActions = () => {
  const { login, logout, checkAuth, setLoading, setError, clearError } = useAuthStore()
  return { login, logout, checkAuth, setLoading, setError, clearError }
}