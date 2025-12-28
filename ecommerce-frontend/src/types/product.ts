/**
 * Product-related TypeScript interfaces and types
 * 
 * These types define the structure of product data throughout the application,
 * ensuring type safety and consistency with the backend API.
 */

export interface Product {
  id: string | number // Support both string and number IDs
  name: string
  description: string
  price: number
  originalPrice?: number // For sale items
  currency: string
  imageUrl: string
  imageUrls: string[] // Additional product images
  category: Category
  brand: Brand
  inStock: boolean
  stockQuantity: number
  rating: number
  reviewCount: number
  tags: string[]
  featured?: boolean // Whether product is featured
  active?: boolean // Whether product is active
  specs?: Record<string, string> // Product specifications
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string | number // Support both string and number IDs
  name: string
  slug: string
  description?: string
  parentId?: string | number
  imageUrl?: string
  active?: boolean // Whether category is active
}

export interface Brand {
  id: string | number // Support both string and number IDs
  name: string
  slug: string
  description?: string
  logoUrl?: string
  websiteUrl?: string // Brand website URL
  active?: boolean // Whether brand is active
}

export interface ProductFilters {
  categoryIds?: string[]
  brandIds?: string[]
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  minRating?: number
  tags?: string[]
  sortBy?: ProductSortOption
  sortOrder?: 'asc' | 'desc'
}

export type ProductSortOption = 
  | 'name'
  | 'price'
  | 'rating'
  | 'createdAt'
  | 'popularity'

export interface ProductSearchParams {
  query?: string
  filters?: ProductFilters
  page?: number
  limit?: number
}

export interface ProductSearchResponse {
  products: Product[]
  totalCount: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ProductListResponse {
  products: Product[]
  totalCount: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}