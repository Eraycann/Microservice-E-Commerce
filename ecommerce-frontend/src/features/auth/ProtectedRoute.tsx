import { useEffect } from 'react'
import { useAuth } from './authStore'
import AuthService from '@/services/authService'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectToLogin?: boolean
}

/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes requiring authentication.
 * 
 * Behavior:
 * - If user is authenticated: renders children
 * - If user is not authenticated and redirectToLogin is true: redirects to login
 * - If user is not authenticated and redirectToLogin is false: renders fallback
 * 
 * This component automatically handles the redirect to Keycloak login when needed.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = null,
  redirectToLogin = true,
}) => {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // If not loading, not authenticated, and should redirect to login
    if (!isLoading && !isAuthenticated && redirectToLogin) {
      console.log('[ProtectedRoute] User not authenticated, redirecting to login...')
      
      // Redirect to login using AuthService
      AuthService.initiateLogin()
    }
  }, [isAuthenticated, isLoading, redirectToLogin])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>
  }

  // If not authenticated and not redirecting, show fallback
  if (!redirectToLogin) {
    return <>{fallback}</>
  }

  // If redirecting to login, show loading state
  // (the redirect will happen via useEffect)
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  )
}

/**
 * Higher-order component version of ProtectedRoute
 * 
 * Usage: const ProtectedComponent = withAuth(MyComponent)
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  )
}

export default ProtectedRoute