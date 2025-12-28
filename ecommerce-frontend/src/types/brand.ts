/**
 * Brand Types
 */

export interface Brand {
  id: number
  name: string
  description?: string
  slug?: string
  logoUrl?: string
  websiteUrl?: string
  active?: boolean
  productCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface BrandStats {
  id: number
  name: string
  productCount: number
  salesCount: number
}