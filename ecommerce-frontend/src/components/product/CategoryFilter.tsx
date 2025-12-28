/**
 * CategoryFilter Component
 * 
 * A filter component for selecting product categories and brands.
 * Features:
 * - Multi-select category filtering
 * - Brand filtering
 * - Price range filtering
 * - Stock availability filtering
 * - Rating filtering
 * - URL-based state management
 * - Clear filters functionality
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { productService } from '@/services/productService'
import { 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Star,
  DollarSign,
  Package,
  Tag
} from 'lucide-react'
import type { ProductFilters } from '@/types/product'

interface CategoryFilterProps {
  onFiltersChange: (filters: ProductFilters) => void
  className?: string
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  onFiltersChange,
  className = ''
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: false,
    price: false,
    rating: false,
    stock: false
  })

  // Current filter state
  const [filters, setFilters] = useState<ProductFilters>({
    categoryIds: [],
    brandIds: [],
    minPrice: undefined,
    maxPrice: undefined,
    inStockOnly: false,
    minRating: undefined,
    sortBy: 'name',
    sortOrder: 'asc'
  })

  // Fetch categories and brands
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => productService.getBrands(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: ProductFilters = {
      categoryIds: searchParams.getAll('category'),
      brandIds: searchParams.getAll('brand'),
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      inStockOnly: searchParams.get('inStock') === 'true',
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'name',
      sortOrder: (searchParams.get('sortOrder') as any) || 'asc'
    }
    
    setFilters(urlFilters)
    onFiltersChange(urlFilters)
  }, [searchParams, onFiltersChange])

  // Update URL when filters change
  const updateFilters = (newFilters: ProductFilters) => {
    setFilters(newFilters)
    onFiltersChange(newFilters)

    // Update URL params
    const params = new URLSearchParams()
    
    newFilters.categoryIds?.forEach(id => params.append('category', id))
    newFilters.brandIds?.forEach(id => params.append('brand', id))
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString())
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString())
    if (newFilters.inStockOnly) params.set('inStock', 'true')
    if (newFilters.minRating) params.set('minRating', newFilters.minRating.toString())
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy)
    if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder)

    setSearchParams(params)
  }

  const toggleCategory = (categoryId: string) => {
    const currentCategories = filters.categoryIds || []
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId]
    
    updateFilters({ ...filters, categoryIds: newCategories })
  }

  const toggleBrand = (brandId: string) => {
    const currentBrands = filters.brandIds || []
    const newBrands = currentBrands.includes(brandId)
      ? currentBrands.filter(id => id !== brandId)
      : [...currentBrands, brandId]
    
    updateFilters({ ...filters, brandIds: newBrands })
  }

  const updatePriceRange = (min?: number, max?: number) => {
    updateFilters({ ...filters, minPrice: min, maxPrice: max })
  }

  const updateRating = (rating?: number) => {
    updateFilters({ ...filters, minRating: rating })
  }

  const toggleStockFilter = () => {
    updateFilters({ ...filters, inStockOnly: !filters.inStockOnly })
  }

  const updateSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    updateFilters({ ...filters, sortBy: sortBy as any, sortOrder })
  }

  const clearFilters = () => {
    const clearedFilters: ProductFilters = {
      categoryIds: [],
      brandIds: [],
      minPrice: undefined,
      maxPrice: undefined,
      inStockOnly: false,
      minRating: undefined,
      sortBy: 'name',
      sortOrder: 'asc'
    }
    updateFilters(clearedFilters)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const hasActiveFilters = 
    (filters.categoryIds?.length || 0) > 0 ||
    (filters.brandIds?.length || 0) > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStockOnly ||
    filters.minRating !== undefined

  return (
    <div className={`bg-card border rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <h3 className="font-semibold">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        {/* Sort Options */}
        <div className="p-4 border-b">
          <h4 className="font-medium mb-3 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Sort By
          </h4>
          <div className="space-y-2">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                updateSort(sortBy, sortOrder as 'asc' | 'desc')
              }}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="rating-desc">Rating (High to Low)</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="popularity-desc">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 border-b">
          <button
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between mb-3 text-left"
          >
            <h4 className="font-medium flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Categories
            </h4>
            {expandedSections.categories ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
            }
          </button>
          
          {expandedSections.categories && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categoryIds?.includes(String(category.id)) || false}
                    onChange={() => toggleCategory(String(category.id))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Brands */}
        <div className="p-4 border-b">
          <button
            onClick={() => toggleSection('brands')}
            className="w-full flex items-center justify-between mb-3 text-left"
          >
            <h4 className="font-medium flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Brands
            </h4>
            {expandedSections.brands ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
            }
          </button>
          
          {expandedSections.brands && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map((brand) => (
                <label key={brand.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.brandIds?.includes(String(brand.id)) || false}
                    onChange={() => toggleBrand(String(brand.id))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{brand.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="p-4 border-b">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between mb-3 text-left"
          >
            <h4 className="font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Price Range
            </h4>
            {expandedSections.price ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
            }
          </button>
          
          {expandedSections.price && (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => updatePriceRange(
                    e.target.value ? Number(e.target.value) : undefined,
                    filters.maxPrice
                  )}
                  className="flex-1 p-2 border rounded-md bg-background text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => updatePriceRange(
                    filters.minPrice,
                    e.target.value ? Number(e.target.value) : undefined
                  )}
                  className="flex-1 p-2 border rounded-md bg-background text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="p-4 border-b">
          <button
            onClick={() => toggleSection('rating')}
            className="w-full flex items-center justify-between mb-3 text-left"
          >
            <h4 className="font-medium flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Minimum Rating
            </h4>
            {expandedSections.rating ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
            }
          </button>
          
          {expandedSections.rating && (
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === rating}
                    onChange={() => updateRating(rating)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm">& up</span>
                  </div>
                </label>
              ))}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === undefined}
                  onChange={() => updateRating(undefined)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Any rating</span>
              </label>
            </div>
          )}
        </div>

        {/* Stock Availability */}
        <div className="p-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={toggleStockFilter}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium">In stock only</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default CategoryFilter