/**
 * Brand Service
 * 
 * Handles brand-related API operations using ProductService backend
 */

import { apiClient } from '@/lib/axios'

export interface Brand {
  id: number
  name: string
  slug: string
  description?: string
  logoUrl?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export class BrandService {
  private static instance: BrandService
  private readonly baseUrl = '/api/v1/brands'

  private constructor() {}

  public static getInstance(): BrandService {
    if (!BrandService.instance) {
      BrandService.instance = new BrandService()
    }
    return BrandService.instance
  }

  /**
   * Get all brands from ProductService
   * Uses: GET /api/v1/brands
   */
  async getAllBrands(): Promise<Brand[]> {
    try {
      console.log('[BrandService] Getting all brands from ProductService...')
      const response = await apiClient.get<Brand[]>(this.baseUrl)
      console.log('[BrandService] Brands received:', response.data.length)
      return response.data
    } catch (error) {
      console.warn('[BrandService] Failed to get brands:', error)
      return []
    }
  }

  /**
   * Get brand by ID
   * Uses: GET /api/v1/brands/{id}
   */
  async getBrandById(id: string): Promise<Brand | null> {
    try {
      console.log('[BrandService] Getting brand by ID:', id)
      const response = await apiClient.get<Brand>(`${this.baseUrl}/${id}`)
      console.log('[BrandService] Brand found:', response.data)
      return response.data
    } catch (error) {
      console.warn('[BrandService] Failed to get brand:', error)
      return null
    }
  }

  /**
   * Get top brands (most popular) - fallback to all brands
   */
  async getTopBrands(limit: number = 10): Promise<Brand[]> {
    try {
      console.log('[BrandService] Getting top brands...')
      const brands = await this.getAllBrands()
      const topBrands = brands.slice(0, limit)
      console.log('[BrandService] Top brands received:', topBrands.length)
      return topBrands
    } catch (error) {
      console.warn('[BrandService] Failed to get top brands:', error)
      return []
    }
  }

  /**
   * Create brand (admin only)
   * Uses: POST /api/v1/brands
   */
  async createBrand(brandData: {
    name: string
    description?: string
    logoUrl?: string
  }): Promise<Brand | null> {
    try {
      console.log('[BrandService] Creating brand:', brandData)
      const response = await apiClient.post<Brand>(this.baseUrl, brandData)
      console.log('[BrandService] Brand created:', response.data)
      return response.data
    } catch (error) {
      console.error('[BrandService] Failed to create brand:', error)
      return null
    }
  }

  /**
   * Update brand (admin only)
   * Uses: PUT /api/v1/brands/{id}
   */
  async updateBrand(id: number, brandData: {
    name: string
    description?: string
    logoUrl?: string
  }): Promise<Brand | null> {
    try {
      console.log('[BrandService] Updating brand:', id, brandData)
      const response = await apiClient.put<Brand>(`${this.baseUrl}/${id}`, brandData)
      console.log('[BrandService] Brand updated:', response.data)
      return response.data
    } catch (error) {
      console.error('[BrandService] Failed to update brand:', error)
      return null
    }
  }

  /**
   * Delete brand (admin only)
   * Uses: DELETE /api/v1/brands/{id}
   */
  async deleteBrand(id: number): Promise<boolean> {
    try {
      console.log('[BrandService] Deleting brand:', id)
      await apiClient.delete(`${this.baseUrl}/${id}`)
      console.log('[BrandService] Brand deleted successfully')
      return true
    } catch (error) {
      console.error('[BrandService] Failed to delete brand:', error)
      return false
    }
  }
}

// Export singleton instance
export const brandService = BrandService.getInstance()