/**
 * Category Types
 */

export interface Category {
  id: number
  name: string
  description?: string
  slug?: string
  parentId?: number
  level?: number
  active?: boolean
  productCount?: number
  imageUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface CategoryTree extends Category {
  children?: CategoryTree[]
}

export interface CategoryStats {
  id: number
  name: string
  productCount: number
  salesCount: number
}