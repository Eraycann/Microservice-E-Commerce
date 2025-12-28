import { QueryClient, DefaultOptions } from '@tanstack/react-query'

/**
 * Default options for TanStack Query
 * 
 * Configuration optimized for e-commerce application:
 * - 5 minute stale time for most data (products, categories don't change often)
 * - No refetch on window focus (prevents unnecessary API calls)
 * - Retry failed requests 3 times with exponential backoff
 * - Cache data for 10 minutes before garbage collection
 */
const queryConfig: DefaultOptions = {
  queries: {
    // Data is considered fresh for 5 minutes
    staleTime: 1000 * 60 * 5, // 5 minutes
    
    // Cache data for 10 minutes before garbage collection
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    
    // Don't refetch when window regains focus
    refetchOnWindowFocus: false,
    
    // Don't refetch when component remounts
    refetchOnMount: true,
    
    // Retry failed requests
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
    
    // Exponential backoff for retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  
  mutations: {
    // Retry mutations once on failure
    retry: 1,
    
    // Shorter retry delay for mutations
    retryDelay: 1000,
  },
}

/**
 * Create and configure QueryClient singleton
 * 
 * This client will be used throughout the application for all server state management.
 * It includes optimized defaults for caching, retrying, and error handling.
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: queryConfig,
  })
}

/**
 * Singleton QueryClient instance
 * 
 * This ensures we have a single QueryClient throughout the application,
 * which is important for proper cache management and state consistency.
 */
export const queryClient = createQueryClient()

/**
 * Query key factory for consistent cache key management
 * 
 * This helps organize and manage cache keys across the application,
 * making it easier to invalidate related queries and avoid key conflicts.
 */
export const queryKeys = {
  // Authentication
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    featured: () => [...queryKeys.products.all, 'featured'] as const,
  },
  
  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },
  
  // Brands
  brands: {
    all: ['brands'] as const,
    lists: () => [...queryKeys.brands.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.brands.lists(), filters] as const,
  },
  
  // Cart
  cart: {
    all: ['cart'] as const,
    current: () => [...queryKeys.cart.all, 'current'] as const,
  },
  
  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
  
  // Search
  search: {
    all: ['search'] as const,
    results: (query: string, filters?: Record<string, any>) => 
      [...queryKeys.search.all, 'results', query, filters] as const,
    suggestions: (query: string) => 
      [...queryKeys.search.all, 'suggestions', query] as const,
  },
  
  // Recommendations
  recommendations: {
    all: ['recommendations'] as const,
    homepage: () => [...queryKeys.recommendations.all, 'homepage'] as const,
    product: (productId: string) => [...queryKeys.recommendations.all, 'product', productId] as const,
  },
  
  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    addresses: () => [...queryKeys.user.all, 'addresses'] as const,
    orders: () => [...queryKeys.user.all, 'orders'] as const,
  },
} as const

/**
 * Utility functions for cache management
 */
export const cacheUtils = {
  /**
   * Invalidate all queries for a specific entity
   */
  invalidateEntity: (entity: keyof typeof queryKeys) => {
    const entityQueries = queryKeys[entity]
    if ('all' in entityQueries) {
      return queryClient.invalidateQueries({ queryKey: (entityQueries as any).all })
    }
    // For entities without 'all' key, invalidate the entire entity
    return queryClient.invalidateQueries({ queryKey: [entity] })
  },
  
  /**
   * Clear all cached data
   */
  clearAll: () => {
    queryClient.clear()
  },
  
  /**
   * Remove specific query from cache
   */
  removeQuery: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey })
  },
  
  /**
   * Prefetch a query
   */
  prefetch: <T>(queryKey: readonly unknown[], queryFn: () => Promise<T>) => {
    return queryClient.prefetchQuery({ queryKey, queryFn })
  },
}

/**
 * Default export
 */
export default queryClient