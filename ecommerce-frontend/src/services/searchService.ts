/**
 * Search Service - Simplified to work with existing backend
 * 
 * Backend SearchController API endpoints:
 * - GET /api/v1/search - Basic search with query parameter
 * - GET /api/v1/search/filter - Detailed filtering
 * - GET /api/v1/search/suggestions - Auto-complete
 * - GET /api/v1/search/featured - Featured products
 * - GET /api/v1/search/bestsellers - Best sellers
 * - GET /api/v1/search/top-brands - Top brands
 */

import { apiClient } from '@/lib/axios'

// Backend ProductIndex model interface
export interface ProductIndex {
  id: string
  name: string
  description: string
  brand: string
  category: string
  price: number
  active: boolean
  slug: string
  imageUrl: string
  specs: Record<string, any>
  featured: boolean
  salesCount: number
  rating?: number
  reviewCount?: number
  stockQuantity?: number
  createdAt?: string
  updatedAt?: string
  categoryId?: string
  brandId?: string
  tags?: string[]
  discountPercentage?: number
  discountedPrice?: number
  inStock?: boolean
  effectivePrice?: number
  discounted?: boolean
}

export interface SearchFilters {
  query?: string
  brand?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  specs?: Record<string, string>
}

export class SearchService {
  private static instance: SearchService
  private readonly baseUrl = '/api/v1/search'

  private constructor() {}

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  /**
   * Basic search - GET /api/v1/search?query={query}
   */
  async search(query?: string): Promise<ProductIndex[]> {
    try {
      const params: any = {}
      if (query) params.query = query
      
      const response = await apiClient.get<ProductIndex[]>(this.baseUrl, { params })
      
      // Add to search history if query provided
      if (query && query.trim()) {
        this.addToSearchHistory(query.trim(), response.data.length)
      }
      
      return response.data
    } catch (error) {
      console.error('[SearchService] Search failed:', error)
      return []
    }
  }

  /**
   * Filter products - GET /api/v1/search/filter
   */
  async filterProducts(filters: SearchFilters): Promise<ProductIndex[]> {
    try {
      const params: any = {}
      
      if (filters.query) params.query = filters.query
      if (filters.brand) params.brand = filters.brand
      if (filters.category) params.category = filters.category
      if (filters.minPrice !== undefined) params.minPrice = filters.minPrice
      if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice
      
      // Add spec_ parameters
      if (filters.specs) {
        Object.entries(filters.specs).forEach(([key, value]) => {
          params[`spec_${key}`] = value
        })
      }
      
      console.log('[SearchService] Filtering products with params:', params)
      const response = await apiClient.get<ProductIndex[]>(`${this.baseUrl}/filter`, { params })
      console.log('[SearchService] Filter results:', response.data.length, 'products')
      
      // Add to search history if query provided
      if (filters.query && filters.query.trim()) {
        this.addToSearchHistory(filters.query.trim(), response.data.length)
      }
      
      return response.data
    } catch (error) {
      console.error('[SearchService] Filter failed:', error)
      return []
    }
  }

  /**
   * Get suggestions - GET /api/v1/search/suggestions?input={input}
   */
  async getSuggestions(input: string): Promise<string[]> {
    if (!input.trim()) return []
    
    try {
      const response = await apiClient.get<string[]>(`${this.baseUrl}/suggestions`, {
        params: { input }
      })
      return response.data
    } catch (error) {
      console.error('[SearchService] Suggestions failed:', error)
      return []
    }
  }

  /**
   * Get featured products - GET /api/v1/search/featured
   */
  async getFeaturedProducts(): Promise<ProductIndex[]> {
    try {
      const response = await apiClient.get<ProductIndex[]>(`${this.baseUrl}/featured`)
      return response.data
    } catch (error) {
      console.error('[SearchService] Featured products failed:', error)
      return []
    }
  }

  /**
   * Get best sellers - GET /api/v1/search/bestsellers
   */
  async getBestSellers(): Promise<ProductIndex[]> {
    try {
      const response = await apiClient.get<ProductIndex[]>(`${this.baseUrl}/bestsellers`)
      return response.data
    } catch (error) {
      console.error('[SearchService] Best sellers failed:', error)
      return []
    }
  }

  /**
   * Get top brands - GET /api/v1/search/top-brands
   */
  async getTopBrands(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(`${this.baseUrl}/top-brands`)
      return response.data
    } catch (error) {
      console.error('[SearchService] Top brands failed:', error)
      return []
    }
  }

  /**
   * Convert ProductIndex to Product format for compatibility
   */
  convertToProduct(productIndex: ProductIndex): any {
    return {
      id: productIndex.id,
      name: productIndex.name,
      description: productIndex.description,
      price: productIndex.price,
      currency: 'TRY',
      imageUrl: productIndex.imageUrl,
      imageUrls: productIndex.imageUrl ? [productIndex.imageUrl] : [],
      category: {
        id: productIndex.category,
        name: productIndex.category,
        slug: productIndex.category.toLowerCase().replace(/\s+/g, '-')
      },
      brand: {
        id: productIndex.brand,
        name: productIndex.brand,
        slug: productIndex.brand.toLowerCase().replace(/\s+/g, '-')
      },
      inStock: productIndex.active,
      stockQuantity: productIndex.active ? 10 : 0,
      rating: 0,
      reviewCount: 0,
      tags: [],
      featured: productIndex.featured,
      active: productIndex.active,
      specs: productIndex.specs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Compatibility methods for existing components
   */
  async searchProducts(params: { q?: string; page?: number; size?: number }): Promise<{
    products: any[]
    totalElements: number
    totalPages: number
  }> {
    const results = await this.search(params.q)
    const products = results.map(p => this.convertToProduct(p))
    
    return {
      products,
      totalElements: products.length,
      totalPages: 1
    }
  }

  async getAllProducts(): Promise<{
    products: any[]
    totalElements: number
    totalPages: number
  }> {
    const results = await this.search()
    const products = results.map(p => this.convertToProduct(p))
    
    return {
      products,
      totalElements: products.length,
      totalPages: 1
    }
  }

  async basicSearch(query?: string): Promise<any[]> {
    const results = await this.search(query)
    return results.map(p => this.convertToProduct(p))
  }

  async getFeaturedProductsForHome(): Promise<any[]> {
    const results = await this.getFeaturedProducts()
    return results.map(p => this.convertToProduct(p))
  }

  async getBestSellerProducts(): Promise<any[]> {
    const results = await this.getBestSellers()
    return results.map(p => this.convertToProduct(p))
  }

  async getTopCategories(): Promise<string[]> {
    // Backend doesn't support this, return empty array
    return []
  }

  /**
   * Get search suggestions in expected format
   */
  async getSearchSuggestions(input: string): Promise<{
    suggestions: Array<{
      text: string
      type: 'query' | 'product' | 'category' | 'brand'
      data?: any
    }>
  }> {
    const suggestions = await this.getSuggestions(input)
    return {
      suggestions: suggestions.map(text => ({
        text,
        type: 'query' as const,
        data: {}
      }))
    }
  }

  /**
   * Search history management (localStorage-based)
   */
  getSearchHistory(): {
    recent: Array<{
      query: string
      timestamp: number
      resultCount?: number
    }>
  } {
    try {
      const history = localStorage.getItem('search-history')
      if (history) {
        const parsed = JSON.parse(history)
        return { recent: parsed.recent || [] }
      }
    } catch (error) {
      console.warn('[SearchService] Failed to load search history:', error)
    }
    
    return { recent: [] }
  }

  addToSearchHistory(query: string, resultCount?: number): void {
    try {
      const history = this.getSearchHistory()
      const newEntry = {
        query: query.trim(),
        timestamp: Date.now(),
        resultCount
      }
      
      // Remove existing entry if it exists
      const filtered = history.recent.filter(item => item.query !== newEntry.query)
      
      // Add to beginning and limit to 10 items
      const updated = [newEntry, ...filtered].slice(0, 10)
      
      localStorage.setItem('search-history', JSON.stringify({
        recent: updated
      }))
      
      console.log('[SearchService] Search history updated:', newEntry.query)
    } catch (error) {
      console.warn('[SearchService] Failed to save search history:', error)
    }
  }

  clearSearchHistory(): void {
    try {
      localStorage.removeItem('search-history')
    } catch (error) {
      console.warn('[SearchService] Failed to clear search history:', error)
    }
  }

  /**
   * Get popular searches (fallback implementation)
   */
  async getPopularSearches(): Promise<string[]> {
    // Return common search terms as fallback
    return [
      'iPhone',
      'Samsung',
      'Laptop',
      'Kulaklık',
      'Telefon',
      'Tablet',
      'Oyun',
      'Bilgisayar'
    ]
  }
}

// Singleton instance
export const searchService = SearchService.getInstance()

// SearchUtils utility class
export class SearchUtils {
  /**
   * Build search URL with parameters
   */
  static buildSearchUrl(params: {
    q?: string
    category?: string
    brand?: string
    featured?: boolean
    sort?: string
  }): string {
    const searchParams = new URLSearchParams()
    
    if (params.q) searchParams.set('q', params.q)
    if (params.category) searchParams.set('category', params.category)
    if (params.brand) searchParams.set('brand', params.brand)
    if (params.featured) searchParams.set('featured', 'true')
    if (params.sort) searchParams.set('sort', params.sort)
    
    const queryString = searchParams.toString()
    return queryString ? `/products?${queryString}` : '/products'
  }

  /**
   * Parse search URL parameters
   */
  static parseSearchUrl(searchParams: URLSearchParams): {
    q?: string
    category?: string
    brand?: string
    featured?: boolean
    sort?: string
    page?: number
    size?: number
  } {
    return {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      featured: searchParams.get('featured') === 'true' || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      size: searchParams.get('size') ? parseInt(searchParams.get('size')!) : undefined
    }
  }
}