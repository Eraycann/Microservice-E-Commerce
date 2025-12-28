/**
 * Category Service
 * 
 * Handles category-related API operations using ProductService backend
 */

import { apiClient } from '@/lib/axios'

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  imageUrl?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export class CategoryService {
  private static instance: CategoryService
  private readonly baseUrl = '/api/v1/categories'

  private constructor() {}

  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService()
    }
    return CategoryService.instance
  }

  /**
   * Get all categories from ProductService
   * Uses: GET /api/v1/categories
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      console.log('[CategoryService] Getting all categories from ProductService...')
      const response = await apiClient.get<Category[]>(this.baseUrl)
      console.log('[CategoryService] Categories received:', response.data.length)
      return response.data
    } catch (error) {
      console.warn('[CategoryService] Failed to get categories:', error)
      return []
    }
  }

  /**
   * Get category by ID
   * Uses: GET /api/v1/categories/{id}
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      console.log('[CategoryService] Getting category by ID:', id)
      const response = await apiClient.get<Category>(`${this.baseUrl}/${id}`)
      console.log('[CategoryService] Category found:', response.data)
      return response.data
    } catch (error) {
      console.warn('[CategoryService] Failed to get category:', error)
      return null
    }
  }

  /**
   * Get top categories (most popular) - fallback to all categories
   */
  async getTopCategories(limit: number = 10): Promise<Category[]> {
    try {
      console.log('[CategoryService] Getting top categories...')
      const categories = await this.getAllCategories()
      const topCategories = categories.slice(0, limit)
      console.log('[CategoryService] Top categories received:', topCategories.length)
      return topCategories
    } catch (error) {
      console.warn('[CategoryService] Failed to get top categories:', error)
      return []
    }
  }

  /**
   * Create category (admin only)
   * Uses: POST /api/v1/categories
   */
  async createCategory(categoryData: {
    name: string
    description?: string
    imageUrl?: string
  }): Promise<Category | null> {
    try {
      console.log('[CategoryService] Creating category:', categoryData)
      const response = await apiClient.post<Category>(this.baseUrl, categoryData)
      console.log('[CategoryService] Category created:', response.data)
      return response.data
    } catch (error) {
      console.error('[CategoryService] Failed to create category:', error)
      return null
    }
  }

  /**
   * Update category (admin only)
   * Uses: PUT /api/v1/categories/{id}
   */
  async updateCategory(id: number, categoryData: {
    name: string
    description?: string
    imageUrl?: string
  }): Promise<Category | null> {
    try {
      console.log('[CategoryService] Updating category:', id, categoryData)
      const response = await apiClient.put<Category>(`${this.baseUrl}/${id}`, categoryData)
      console.log('[CategoryService] Category updated:', response.data)
      return response.data
    } catch (error) {
      console.error('[CategoryService] Failed to update category:', error)
      return null
    }
  }

  /**
   * Delete category (admin only)
   * Uses: DELETE /api/v1/categories/{id}
   */
  async deleteCategory(id: number): Promise<boolean> {
    try {
      console.log('[CategoryService] Deleting category:', id)
      await apiClient.delete(`${this.baseUrl}/${id}`)
      console.log('[CategoryService] Category deleted successfully')
      return true
    } catch (error) {
      console.error('[CategoryService] Failed to delete category:', error)
      return false
    }
  }
}

// Export singleton instance
export const categoryService = CategoryService.getInstance()