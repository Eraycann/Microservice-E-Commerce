/**
 * Product Service
 * 
 * Handles all product-related API operations including:
 * - Product CRUD operations
 * - Product search and filtering
 * - Category and brand management
 * - Image URL handling utilities
 */

import { apiClient } from '@/lib/axios'
import type { 
  Product, 
  Category, 
  Brand, 
  ProductSearchParams, 
  ProductListResponse 
} from '@/types/product'

// Backend'den dönen DTO tipi
interface ProductDetailResponseDto {
  id: number
  slug: string
  name: string
  description: string
  price: number
  categoryName: string
  brandName: string
  stockCount: number
  specsData: string
  images: Array<{
    id: number
    url: string
    displayOrder: number
    isMain: boolean
  }>
}

export class ProductService {
  private static instance: ProductService
  private readonly baseUrl = '/api/v1/products'

  private constructor() {}

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService()
    }
    return ProductService.instance
  }

  /**
   * Backend DTO'sunu frontend Product tipine dönüştür
   */
  private transformProductDto(dto: ProductDetailResponseDto): Product {
    // Ana resmi bul (isMain=true olan veya ilk resim)
    const mainImage = dto.images?.find(img => img.isMain) || dto.images?.[0]
    const imageUrls = dto.images?.map(img => img.url) || []
    
    return {
      id: dto.id.toString(),
      name: dto.name,
      description: dto.description,
      price: dto.price,
      currency: 'TRY',
      imageUrl: mainImage?.url || '',
      imageUrls: imageUrls,
      category: {
        id: '1', // Backend'de category ID yok, placeholder
        name: dto.categoryName,
        slug: dto.categoryName.toLowerCase().replace(/\s+/g, '-')
      },
      brand: {
        id: '1', // Backend'de brand ID yok, placeholder
        name: dto.brandName,
        slug: dto.brandName.toLowerCase().replace(/\s+/g, '-')
      },
      inStock: dto.stockCount > 0,
      stockQuantity: dto.stockCount,
      rating: 0, // Backend'de rating yok, placeholder
      reviewCount: 0, // Backend'de review count yok, placeholder
      tags: [], // Backend'de tags yok, placeholder
      createdAt: new Date().toISOString(), // Placeholder
      updatedAt: new Date().toISOString() // Placeholder
    }
  }

  /**
   * Get all products with optional pagination and filtering
   * CQRS: Bu method SearchService'e yönlendirilmeli
   */
  async getProducts(params: ProductSearchParams = {}): Promise<ProductListResponse> {
    // SearchService'i import et ve kullan
    const { searchService } = await import('@/services/searchService')
    
    // SearchService parametrelerine dönüştür
    const searchParams = {
      q: params.query,
      page: params.page || 1,
      size: params.limit || 20,
      categories: params.filters?.categoryIds || [],
      brands: params.filters?.brandIds || [],
      minPrice: params.filters?.minPrice,
      maxPrice: params.filters?.maxPrice,
      inStockOnly: params.filters?.inStockOnly,
      minRating: params.filters?.minRating,
      tags: params.filters?.tags || [],
      sort: params.filters?.sortBy || 'relevance'
    }

    const searchResponse = await searchService.searchProducts(searchParams)
    
    // SearchResponse'u ProductListResponse'a dönüştür
    return {
      products: searchResponse.products,
      totalCount: searchResponse.totalElements,
      totalPages: searchResponse.totalPages,
      currentPage: searchResponse.currentPage,
      hasNextPage: !searchResponse.last,
      hasPreviousPage: !searchResponse.first
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<ProductDetailResponseDto>(`${this.baseUrl}/${id}`)
    return this.transformProductDto(response.data)
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/api/v1/categories')
    return response.data
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/api/v1/categories/${id}`)
    return response.data
  }

  /**
   * Get all brands
   */
  async getBrands(): Promise<Brand[]> {
    const response = await apiClient.get<Brand[]>('/api/v1/brands')
    return response.data
  }

  /**
   * Get brand by ID
   */
  async getBrandById(id: string): Promise<Brand> {
    const response = await apiClient.get<Brand>(`/api/v1/brands/${id}`)
    return response.data
  }

  /**
   * Get all products with pagination (Admin use)
   * This is for admin panel product management
   */
  async getAllProducts(page: number = 0, size: number = 20): Promise<{
    content: Product[]
    totalElements: number
    totalPages: number
  }> {
    try {
      // Use search service for getting all products
      const { searchService } = await import('@/services/searchService')
      const searchResult = await searchService.searchProducts({
        page: page + 1, // SearchService uses 1-based pagination
        size: size
      })
      
      return {
        content: searchResult.products,
        totalElements: searchResult.totalElements,
        totalPages: searchResult.totalPages
      }
    } catch (error) {
      console.error('[ProductService] Failed to get all products:', error)
      // Fallback to empty result
      return {
        content: [],
        totalElements: 0,
        totalPages: 0
      }
    }
  }

  /**
   * Search products using SearchService
   * This method delegates to SearchService for consistency
   */
  async searchProducts(params: {
    q?: string
    page?: number
    size?: number
    categories?: string[]
    brands?: string[]
    minPrice?: number
    maxPrice?: number
    inStockOnly?: boolean
    minRating?: number
    sort?: string
  }): Promise<{
    products: Product[]
    totalElements: number
    totalPages: number
  }> {
    const { searchService } = await import('@/services/searchService')
    return searchService.searchProducts(params)
  }
}

// Export singleton instance
export const productService = ProductService.getInstance()

/**
 * Image URL utility functions
 * 
 * These utilities help handle product image URLs consistently across the application,
 * providing fallbacks and optimization options.
 */
export const ImageUtils = {
  /**
   * Get optimized image URL with fallback
   */
  getOptimizedImageUrl(imageUrl: string | undefined, size: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
    if (!imageUrl) {
      return this.getPlaceholderImageUrl(size)
    }

    // If it's already a full URL, return as-is
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }

    // Construct full URL from relative path
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    return `${baseUrl}${imageUrl}?size=${size}`
  },

  /**
   * Get placeholder image URL for missing product images
   */
  getPlaceholderImageUrl(size: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
    const dimensions = {
      thumbnail: '150x150',
      medium: '300x300',
      large: '600x600'
    }
    
    return `https://via.placeholder.com/${dimensions[size]}/e5e7eb/6b7280?text=No+Image`
  },

  /**
   * Get all image URLs for a product with fallbacks
   */
  getProductImageUrls(product: Product): string[] {
    const urls: string[] = []
    
    // Add main image
    if (product.imageUrl) {
      urls.push(this.getOptimizedImageUrl(product.imageUrl))
    }
    
    // Add additional images
    if (product.imageUrls?.length) {
      product.imageUrls.forEach(url => {
        urls.push(this.getOptimizedImageUrl(url))
      })
    }
    
    // If no images, add placeholder
    if (urls.length === 0) {
      urls.push(this.getPlaceholderImageUrl())
    }
    
    return urls
  },

  /**
   * Get the primary image URL for a product
   */
  getPrimaryImageUrl(product: Product, size: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
    return this.getOptimizedImageUrl(product.imageUrl, size)
  }
}