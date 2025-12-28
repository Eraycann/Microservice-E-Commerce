import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'
import AuthService from '@/services/authService'
import { useAuth } from './authStore'

interface LoginButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  children?: React.ReactNode
}

/**
 * LoginButton Component
 * 
 * CRITICAL: This component performs a hard browser redirect to Keycloak.
 * It does NOT use axios - it uses window.location.href for the OAuth2 flow.
 * 
 * The authentication flow:
 * 1. User clicks login button
 * 2. Browser redirects to Keycloak OAuth2 endpoint
 * 3. User authenticates with Keycloak
 * 4. Keycloak redirects back to our backend with authorization code
 * 5. Backend exchanges code for tokens and creates session
 * 6. Backend redirects user back to frontend with HttpOnly session cookie
 * 7. Frontend detects authentication and updates state
 */
export const LoginButton: React.FC<LoginButtonProps> = ({
  variant = 'default',
  size = 'default',
  className,
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth()

  const handleLogin = () => {
    console.log('[LoginButton] Initiating login flow...')
    
    // CRITICAL: Use AuthService which performs hard browser redirect
    // This is essential for the OAuth2 authorization code flow
    AuthService.initiateLogin()
  }

  // Don't show login button if user is already authenticated
  if (isAuthenticated) {
    return null
  }

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      <LogIn className="w-4 h-4 mr-2" />
      {children || (isLoading ? 'Redirecting...' : 'Sign In')}
    </Button>
  )
}

export default LoginButton