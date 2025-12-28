import { Button } from '@/components/ui/button'
import { LogOut, User, Settings } from 'lucide-react'
import { useAuth, useAuthActions } from './authStore'
import { useCartActions } from '@/features/cart/cartStore'
import AuthService from '@/services/authService'

interface UserProfileProps {
  variant?: 'full' | 'compact' | 'minimal'
  className?: string
  showSettings?: boolean
}

/**
 * UserProfile Component
 * 
 * Displays authenticated user information and provides logout functionality.
 * Integrates with the auth store and handles proper cleanup on logout.
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  variant = 'full',
  className = '',
  showSettings = true,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const { logout: logoutFromStore } = useAuthActions()
  const { resetCart } = useCartActions()

  const handleLogout = () => {
    console.log('[UserProfile] Logging out user...')
    
    // Clear local state first
    logoutFromStore()
    resetCart()
    
    // Then perform backend logout with redirect
    AuthService.logout()
  }

  // Don't render if user is not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  // Minimal variant - just logout button
  if (variant === 'minimal') {
    return (
      <Button
        onClick={handleLogout}
        disabled={isLoading}
        variant="ghost"
        size="sm"
        className={className}
      >
        <LogOut className="w-4 h-4" />
      </Button>
    )
  }

  // Compact variant - user name and logout
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {user.firstName} {user.lastName}
          </span>
        </div>
        <Button
          onClick={handleLogout}
          disabled={isLoading}
          variant="ghost"
          size="sm"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  // Full variant - complete user profile display
  return (
    <div className={`bg-card p-4 rounded-lg border ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        
        {showSettings && (
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* User details */}
      <div className="space-y-2 mb-4">
        <div className="text-xs">
          <span className="text-muted-foreground">Member since:</span>{' '}
          <span className="font-medium">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        
        {user.addresses.length > 0 && (
          <div className="text-xs">
            <span className="text-muted-foreground">Addresses:</span>{' '}
            <span className="font-medium">{user.addresses.length}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          onClick={handleLogout}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    </div>
  )
}

export default UserProfile