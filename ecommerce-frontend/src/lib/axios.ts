import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { v4 as uuidv4 } from 'uuid'

// Constants
const API_BASE_URL = 'http://localhost:8080'
const GUEST_ID_KEY = 'guest_id'

/**
 * CSRF Token utilities
 */
const csrfManager = {
  /**
   * Get CSRF token from cookie
   */
  getCsrfTokenFromCookie(): string | null {
    const name = 'XSRF-TOKEN'
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    
    if (parts.length === 2) {
      const token = parts.pop()?.split(';').shift()
      return token ? decodeURIComponent(token) : null
    }
    
    return null
  },

  /**
   * Check if CSRF token exists
   */
  hasCsrfToken(): boolean {
    return this.getCsrfTokenFromCookie() !== null
  },

  /**
   * Debug function to log CSRF token status
   */
  debugCsrfToken(): void {
    const token = this.getCsrfTokenFromCookie()
    console.log('[CSRF Debug] Token exists:', !!token)
    console.log('[CSRF Debug] Token value:', token ? `${token.substring(0, 10)}...` : 'null')
    console.log('[CSRF Debug] All cookies:', document.cookie)
  }
}

/**
 * Helper function to get CSRF token (for logging purposes)
 */
const getCsrfTokenFromCookie = csrfManager.getCsrfTokenFromCookie
const guestIdManager = {
  /**
   * Get guest ID from localStorage, generate new one if missing
   */
  getGuestId(): string {
    let guestId = localStorage.getItem(GUEST_ID_KEY)
    
    if (!guestId) {
      guestId = uuidv4()
      localStorage.setItem(GUEST_ID_KEY, guestId)
    }
    
    return guestId
  },

  /**
   * Remove guest ID from localStorage (used after user login)
   */
  clearGuestId(): void {
    localStorage.removeItem(GUEST_ID_KEY)
  },

  /**
   * Check if guest ID exists in localStorage
   */
  hasGuestId(): boolean {
    return localStorage.getItem(GUEST_ID_KEY) !== null
  }
}

/**
 * Authentication state manager
 * For now, we assume user is not authenticated
 * This will be updated when we implement the auth system
 */
const authManager = {
  /**
   * Check if user is currently authenticated
   * TODO: Implement proper authentication check
   */
  isAuthenticated(): boolean {
    // For now, assume user is not authenticated
    // This will be updated when we implement the auth store
    return false
  }
}

/**
 * Create axios instance with BFF configuration
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // MANDATORY: Enable HttpOnly cookies
    timeout: 10000, // 10 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
    // CSRF Protection for Spring Cloud Gateway BFF
    xsrfCookieName: 'XSRF-TOKEN', // Cookie name that Gateway sends
    xsrfHeaderName: 'X-XSRF-TOKEN', // Header name to send back
  })

  /**
   * Request Interceptor
   * Handles guest ID injection for unauthenticated users and CSRF token
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Only inject X-Guest-Id header if user is not authenticated
      if (!authManager.isAuthenticated()) {
        const guestId = guestIdManager.getGuestId()
        
        // Inject guest ID header
        config.headers['X-Guest-Id'] = guestId
        
        console.log(`[API Client] Request to ${config.url} with Guest ID: ${guestId}`)
      } else {
        console.log(`[API Client] Authenticated request to ${config.url}`)
      }

      // CSRF Token handling for POST/PUT/DELETE requests
      const method = config.method?.toUpperCase()
      if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        const csrfToken = getCsrfTokenFromCookie()
        if (csrfToken) {
          // CSRF token'ı header'a ekle
          config.headers['X-XSRF-TOKEN'] = csrfToken
          
          console.log(`[API Client] CSRF token found for ${method} request to ${config.url}`)
          console.log(`[API Client] CSRF token value: ${csrfToken.substring(0, 10)}...`)
        } else {
          console.warn(`[API Client] No CSRF token found for ${method} request to ${config.url}`)
          // CSRF token yoksa, önce GET request ile token almaya çalış
          if (config.url && !config.url.includes('/api/')) {
            console.log('[API Client] Attempting to fetch CSRF token first...')
          }
        }
      }

      return config
    },
    (error: AxiosError) => {
      console.error('[API Client] Request interceptor error:', error)
      return Promise.reject(error)
    }
  )

  /**
   * Response Interceptor
   * Handles global error responses and logging
   */
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful responses in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Client] Success: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
      }
      
      return response
    },
    (error: AxiosError) => {
      // Log all errors
      console.error('[API Client] Response error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })

      // Handle specific error cases
      if (error.response) {
        const { status } = error.response
        
        switch (status) {
          case 401:
            console.warn('[API Client] Unauthorized - Session may have expired')
            // TODO: Handle session expiration (redirect to login if not on public page)
            break
            
          case 403:
            console.warn('[API Client] Forbidden - Access denied')
            // Check if it's a CSRF token issue
            const errorData = error.response?.data
            if (typeof errorData === 'string' && errorData.includes('CSRF')) {
              console.error('[API Client] CSRF Token Error - Token may be missing or invalid')
              console.log('[API Client] Current CSRF token:', getCsrfTokenFromCookie())
            }
            break
            
          case 404:
            console.warn('[API Client] Not Found - Resource does not exist')
            break
            
          case 500:
            console.error('[API Client] Internal Server Error')
            break
            
          default:
            console.error(`[API Client] HTTP Error ${status}`)
        }
      } else if (error.request) {
        console.error('[API Client] Network Error - No response received')
      } else {
        console.error('[API Client] Request Setup Error:', error.message)
      }

      return Promise.reject(error)
    }
  )

  return instance
}

/**
 * Singleton API client instance
 */
export const apiClient = createApiClient()

/**
 * Export guest ID manager for use in other parts of the application
 */
export { guestIdManager }

/**
 * Export CSRF manager for debugging purposes
 */
export { csrfManager }

/**
 * Export auth manager for future use
 */
export { authManager }

/**
 * Utility function to update authentication state
 * This will be called from the auth store when user logs in/out
 */
export const updateAuthState = (isAuthenticated: boolean) => {
  // Update the auth manager state
  authManager.isAuthenticated = () => isAuthenticated
  
  // Clear guest ID when user becomes authenticated
  if (isAuthenticated && guestIdManager.hasGuestId()) {
    console.log('[API Client] User authenticated - clearing guest ID')
    guestIdManager.clearGuestId()
  }
}

/**
 * Utility function to fetch CSRF token
 * This makes a GET request to trigger CSRF token generation
 */
export const fetchCsrfToken = async (): Promise<void> => {
  try {
    // Make a simple GET request to trigger CSRF token generation
    await apiClient.get('/')
    console.log('[API Client] CSRF token fetch request completed')
  } catch (error) {
    console.warn('[API Client] Failed to fetch CSRF token:', error)
  }
}
/**
 * Default export
 */
export default apiClient

/**
 * Global debug function for development
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.debugCSRF = csrfManager.debugCsrfToken
}