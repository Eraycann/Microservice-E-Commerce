/**
 * Authentication feature exports
 * 
 * This file provides a clean interface for importing auth-related
 * components, hooks, and services from other parts of the application.
 */

// Store and hooks
export { useAuthStore, useAuth, useAuthActions } from './authStore'

// Components
export { default as LoginButton } from './LoginButton'
export { default as UserProfile } from './UserProfile'
export { default as ProtectedRoute, withAuth } from './ProtectedRoute'

// Service
export { default as AuthService } from '@/services/authService'

// Types (re-export from types)
export type { User } from '@/types/user'