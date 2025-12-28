import apiClient from '@/lib/axios'
import { User } from '@/types/user'

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls following the BFF pattern.
 * The backend handles OAuth2 flow with Keycloak and manages sessions via HttpOnly cookies.
 */
export class AuthService {
  /**
   * Get current authenticated user
   * 
   * Fetches user data from the backend. The backend will verify the session
   * using the HttpOnly cookie and return user data if authenticated.
   * 
   * @returns Promise<User> - Current user data
   * @throws Error if user is not authenticated or request fails
   */
  static async getCurrentUser(): Promise<User> {
    try {
      console.log('[Auth Service] Fetching current user...')
      
      const response = await apiClient.get('/api/v1/users/me')
      const user: User = response.data
      
      console.log('[Auth Service] Current user fetched:', user.email)
      return user
    } catch (error: any) {
      console.error('[Auth Service] Failed to get current user:', error)
      
      // If 401, user is not authenticated
      if (error.response?.status === 401) {
        throw new Error('User not authenticated')
      }
      
      // For other errors, throw a generic error
      throw new Error('Failed to fetch user data')
    }
  }

  /**
   * Check authentication status
   * 
   * Attempts to fetch current user to verify if the user is authenticated.
   * This is used during app initialization and for periodic auth checks.
   * 
   * @returns Promise<User | null> - User data if authenticated, null if not
   */
  static async checkAuthStatus(): Promise<User | null> {
    try {
      console.log('[Auth Service] Checking authentication status...')
      
      const user = await this.getCurrentUser()
      console.log('[Auth Service] User is authenticated:', user.email)
      return user
    } catch (error) {
      console.log('[Auth Service] User is not authenticated')
      return null
    }
  }

  /**
   * Initiate login flow
   * 
   * CRITICAL: This performs a hard browser redirect to the Keycloak OAuth2 endpoint.
   * We do NOT use axios for this because it needs to be a full browser navigation
   * to handle the OAuth2 authorization code flow properly.
   * 
   * The flow:
   * 1. Browser redirects to Keycloak login page
   * 2. User enters credentials
   * 3. Keycloak redirects back to our app with authorization code
   * 4. Backend exchanges code for tokens and creates session
   * 5. User is redirected back to the frontend with session cookie
   */
  static initiateLogin(): void {
    console.log('[Auth Service] Initiating login flow...')
    
    // CRITICAL: Hard browser redirect - do NOT use axios
    window.location.href = 'http://localhost:8080/oauth2/authorization/keycloak'
  }

  /**
   * Logout user
   * 
   * Performs logout by redirecting to the backend logout endpoint.
   * The backend will:
   * 1. Clear the session cookie
   * 2. Optionally redirect to Keycloak logout
   * 3. Redirect back to the frontend
   * 
   * We use a hard redirect to ensure proper session cleanup.
   */
  static logout(): void {
    console.log('[Auth Service] Logging out user...')
    
    // Hard browser redirect to logout endpoint
    window.location.href = 'http://localhost:8080/logout'
  }

  /**
   * Alternative logout method that calls API first then redirects
   * 
   * This can be used if you want to perform cleanup actions before logout
   * or if the backend expects an API call before redirect.
   */
  static async logoutWithApiCall(): Promise<void> {
    try {
      console.log('[Auth Service] Calling logout API...')
      
      // Call logout API endpoint
      await apiClient.post('/api/auth/logout')
      
      console.log('[Auth Service] Logout API call successful, redirecting...')
      
      // Then redirect to logout URL
      window.location.href = 'http://localhost:8080/logout'
    } catch (error) {
      console.error('[Auth Service] Logout API call failed, redirecting anyway:', error)
      
      // Even if API call fails, still redirect to logout
      window.location.href = 'http://localhost:8080/logout'
    }
  }

  /**
   * Handle OAuth2 callback
   * 
   * This method can be called after the user returns from Keycloak
   * to fetch the user data and update the application state.
   * 
   * @returns Promise<User | null> - User data if login was successful
   */
  static async handleOAuthCallback(): Promise<User | null> {
    try {
      console.log('[Auth Service] Handling OAuth callback...')
      
      // Attempt to get user data after OAuth redirect
      const user = await this.getCurrentUser()
      
      if (user) {
        console.log('[Auth Service] OAuth login successful:', user.email)
        return user
      }
      
      return null
    } catch (error) {
      console.error('[Auth Service] OAuth callback handling failed:', error)
      return null
    }
  }

  /**
   * Refresh user data
   * 
   * Re-fetches current user data. Useful for updating user profile
   * after changes or for periodic data refresh.
   * 
   * @returns Promise<User> - Updated user data
   */
  static async refreshUser(): Promise<User> {
    console.log('[Auth Service] Refreshing user data...')
    return this.getCurrentUser()
  }
}

/**
 * Default export for convenience
 */
export default AuthService