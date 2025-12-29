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

// Parametre Tipleri (SearchUtils için)
export interface SearchParamsType {
  q?: string
  category?: string
  categories?: string[]
  brand?: string
  brands?: string[]
  featured?: boolean
  sort?: string
  page?: number
  size?: number
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  minRating?: number
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

  async search(query?: string): Promise<ProductIndex[]> {
    try {
      const params: any = {}
      if (query) params.query = query
      
      const response = await apiClient.get<ProductIndex[]>(this.baseUrl, { params })
      
      if (query && query.trim()) {
        this.addToSearchHistory(query.trim(), response.data.length)
      }
      
      return response.data
    } catch (error) {
      console.error('[SearchService] Search failed:', error)
      return []
    }
  }

  async filterProducts(filters: SearchFilters): Promise<ProductIndex[]> {
    try {
      const params: any = {}
      
      if (filters.query) params.query = filters.query
      if (filters.brand) params.brand = filters.brand
      if (filters.category) params.category = filters.category
      if (filters.minPrice !== undefined) params.minPrice = filters.minPrice
      if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice
      
      if (filters.specs) {
        Object.entries(filters.specs).forEach(([key, value]) => {
          params[`spec_${key}`] = value
        })
      }
      
      const response = await apiClient.get<ProductIndex[]>(`${this.baseUrl}/filter`, { params })
      
      if (filters.query && filters.query.trim()) {
        this.addToSearchHistory(filters.query.trim(), response.data.length)
      }
      
      return response.data
    } catch (error) {
      console.error('[SearchService] Filter failed:', error)
      return []
    }
  }

  // --- SUGGESTIONS & POPULAR ---

  // Temel Suggestion API çağrısı
  async getSuggestions(input: string): Promise<string[]> {
    if (!input.trim()) return []
    try {
      const response = await apiClient.get<string[]>(`${this.baseUrl}/suggestions`, {
        params: { input }
      })
      return response.data
    } catch (error) {
      return []
    }
  }

  // SearchBar'ın beklediği formatta (Düzeltildi)
  async getSearchSuggestions(input: string): Promise<string[]> {
    return this.getSuggestions(input)
  }

  // Popüler aramalar (Fallback)
  async getPopularSearches(): Promise<string[]> {
    return [
      'iPhone', 'Samsung', 'Laptop', 'Kulaklık', 
      'Telefon', 'Tablet', 'Oyun', 'Bilgisayar'
    ]
  }

  // --- FEATURED & BESTSELLERS ---

  async getFeaturedProducts(): Promise<ProductIndex[]> {
    try {
      const response = await apiClient.get<ProductIndex[]>(`${this.baseUrl}/featured`)
      return response.data
    } catch (error) {
      return []
    }
  }

  async getBestSellers(): Promise<ProductIndex[]> {
    try {
      const response = await apiClient.get<ProductIndex[]>(`${this.baseUrl}/bestsellers`)
      return response.data
    } catch (error) {
      return []
    }
  }

  // --- COMPATIBILITY METHODS ---

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
        slug: productIndex.category?.toLowerCase().replace(/\s+/g, '-') || ''
      },
      brand: {
        id: productIndex.brand,
        name: productIndex.brand,
        slug: productIndex.brand?.toLowerCase().replace(/\s+/g, '-') || ''
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

  async searchProducts(params: any): Promise<{
    products: any[]
    totalElements: number
    totalPages: number
    searchTime?: number
  }> {
    const filters: SearchFilters = {
      query: params.q,
      brand: params.brands && params.brands.length > 0 ? params.brands[0] : undefined,
      category: params.categories && params.categories.length > 0 ? params.categories[0] : undefined,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice
    }

    let results: ProductIndex[] = []
    
    if (!filters.brand && !filters.category && !filters.minPrice && !filters.maxPrice && filters.query) {
       results = await this.search(filters.query)
    } else {
       results = await this.filterProducts(filters)
    }

    const products = results.map(p => this.convertToProduct(p))
    
    return {
      products,
      totalElements: products.length,
      totalPages: 1,
      searchTime: 0
    }
  }

  // --- HISTORY MANAGEMENT ---

  getSearchHistory(): { recent: Array<{ query: string, timestamp: number, resultCount?: number }> } {
    try {
      const history = localStorage.getItem('search-history')
      if (history) {
        const parsed = JSON.parse(history)
        return { recent: parsed.recent || [] }
      }
    } catch (error) {}
    return { recent: [] }
  }

  addToSearchHistory(query: string, resultCount?: number): void {
    try {
      const history = this.getSearchHistory()
      const newEntry = { query: query.trim(), timestamp: Date.now(), resultCount }
      const filtered = history.recent.filter(item => item.query !== newEntry.query)
      const updated = [newEntry, ...filtered].slice(0, 10)
      localStorage.setItem('search-history', JSON.stringify({ recent: updated }))
    } catch (error) {}
  }

  removeFromSearchHistory(query: string): void {
    try {
      const history = this.getSearchHistory()
      const updated = history.recent.filter(item => item.query !== query)
      localStorage.setItem('search-history', JSON.stringify({ recent: updated }))
    } catch (error) {}
  }

  clearSearchHistory(): void {
    localStorage.removeItem('search-history')
  }
}

export const searchService = SearchService.getInstance()

export class SearchUtils {
  static buildSearchUrl(params: SearchParamsType): string {
    const searchParams = new URLSearchParams()
    
    if (params.q) searchParams.set('q', params.q)
    
    // Tekil/Çoğul kontrolü
    if (params.categories && params.categories.length > 0) {
      params.categories.forEach(c => searchParams.append('categories', c))
    } else if (params.category) {
      searchParams.set('category', params.category)
    }

    if (params.brands && params.brands.length > 0) {
      params.brands.forEach(b => searchParams.append('brands', b))
    } else if (params.brand) {
      searchParams.set('brand', params.brand)
    }

    if (params.featured) searchParams.set('featured', 'true')
    if (params.sort) searchParams.set('sort', params.sort)
    if (params.inStockOnly) searchParams.set('inStock', 'true')
    
    const queryString = searchParams.toString()
    return queryString ? `/products?${queryString}` : '/products'
  }

  static parseSearchUrl(searchParams: URLSearchParams): SearchParamsType {
    const categories = searchParams.getAll('categories')
    const brands = searchParams.getAll('brands')

    // Tekil parametreleri de kontrol et
    const singleCategory = searchParams.get('category')
    const singleBrand = searchParams.get('brand')

    if (singleCategory && !categories.includes(singleCategory)) categories.push(singleCategory)
    if (singleBrand && !brands.includes(singleBrand)) brands.push(singleBrand)

    return {
      q: searchParams.get('q') || undefined,
      category: singleCategory || undefined,
      categories: categories.length > 0 ? categories : undefined,
      brand: singleBrand || undefined,
      brands: brands.length > 0 ? brands : undefined,
      featured: searchParams.get('featured') === 'true' || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      size: searchParams.get('size') ? parseInt(searchParams.get('size')!) : undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      inStockOnly: searchParams.get('inStock') === 'true',
      minRating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined
    }
  }
}