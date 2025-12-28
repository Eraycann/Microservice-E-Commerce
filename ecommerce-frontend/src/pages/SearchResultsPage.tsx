/**
 * SearchResultsPage Component
 * 
 * A comprehensive search results page featuring:
 * - Search query display and modification
 * - Faceted filtering (categories, brands, price, rating)
 * - Server-side pagination
 * - Sort options
 * - No results fallback with recommendations
 * - Loading and error states
 */

import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/product'
import { SearchBar } from '@/components/search/SearchBar'
import { searchService, SearchUtils } from '@/services/searchService'
import type { SearchParams, SearchFilters } from '@/types/search'
import { 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  X,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Sort options for search results
 */
const SORT_OPTIONS = [
  { value: 'relevance', label: 'İlgililik' },
  { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'rating_desc', label: 'En Yüksek Puanlı' },
  { value: 'newest', label: 'En Yeniler' },
  { value: 'name_asc', label: 'İsim: A-Z' }
]

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Parse URL parameters
  const currentParams = SearchUtils.parseSearchUrl(searchParams)
  const query = currentParams.q || ''
  const page = currentParams.page || 1
  const sort = currentParams.sort || 'relevance'

  // Search results query
  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['search', 'results', currentParams],
    queryFn: async () => {
      // Always use the filter endpoint for search results page
      // This ensures consistent behavior and proper parameter handling
      return searchService.searchProducts(currentParams)
    },
    enabled: true,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Fallback products for no results - always load featured products
  const {
    data: fallbackProducts = [],
    isLoading: fallbackLoading
  } = useQuery({
    queryKey: ['search', 'featured'],
    queryFn: () => searchService.getFeaturedProducts(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Update URL when search parameters change
  const updateSearchParams = (newParams: Partial<SearchParams>) => {
    const updatedParams = { ...currentParams, ...newParams }
    
    // Reset page when filters change (unless page is explicitly set)
    if (!('page' in newParams) && Object.keys(newParams).some(key => key !== 'page')) {
      updatedParams.page = 1
    }

    const newSearchParams = new URLSearchParams()
    
    if (updatedParams.q) {
      newSearchParams.set('q', updatedParams.q)
    }
    if (updatedParams.page && updatedParams.page > 1) {
      newSearchParams.set('page', updatedParams.page.toString())
    }
    if (updatedParams.sort && updatedParams.sort !== 'relevance') {
      newSearchParams.set('sort', updatedParams.sort)
    }
    // Handle multiple categories as separate parameters
    if (updatedParams.categories?.length) {
      updatedParams.categories.forEach(category => {
        newSearchParams.append('categories', category)
      })
    }
    // Handle multiple brands as separate parameters
    if (updatedParams.brands?.length) {
      updatedParams.brands.forEach(brand => {
        newSearchParams.append('brands', brand)
      })
    }
    if (updatedParams.minPrice !== undefined) {
      newSearchParams.set('minPrice', updatedParams.minPrice.toString())
    }
    if (updatedParams.maxPrice !== undefined) {
      newSearchParams.set('maxPrice', updatedParams.maxPrice.toString())
    }
    if (updatedParams.inStockOnly) {
      newSearchParams.set('inStock', 'true')
    }
    if (updatedParams.minRating !== undefined) {
      newSearchParams.set('rating', updatedParams.minRating.toString())
    }

    setSearchParams(newSearchParams)
  }

  // Handle new search
  const handleSearch = (newQuery: string) => {
    updateSearchParams({ q: newQuery, page: 1 })
  }

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    updateSearchParams({ sort: newSort })
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage })
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle filter changes
  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    updateSearchParams({ [filterType]: value })
  }

  // Clear all filters
  const clearFilters = () => {
    updateSearchParams({
      categories: [],
      brands: [],
      minPrice: undefined,
      maxPrice: undefined,
      inStockOnly: false,
      minRating: undefined,
      sort: 'relevance'
    })
  }

  // Check if any filters are active
  const hasActiveFilters = 
    currentParams.categories?.length ||
    currentParams.brands?.length ||
    currentParams.minPrice !== undefined ||
    currentParams.maxPrice !== undefined ||
    currentParams.inStockOnly ||
    currentParams.minRating !== undefined ||
    (currentParams.sort && currentParams.sort !== 'relevance')

  const products = searchResults?.products || []
  const totalResults = searchResults?.totalElements || 0
  const totalPages = searchResults?.totalPages || 0
  const hasResults = totalResults > 0
  const showFallback = !isLoading && !hasResults && query

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
          <div className="flex-1">
            <SearchBar
              initialQuery={query}
              onSearch={handleSearch}
              size="lg"
              placeholder="Ürün ara..."
            />
          </div>
        </div>

        {/* Search Info */}
        {query && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {isLoading ? (
                <p className="text-muted-foreground">Arıyor...</p>
              ) : hasResults ? (
                <p className="text-muted-foreground">
                  "{query}" için {totalResults.toLocaleString()} sonuç
                  {searchResults?.searchTime && (
                    <span className="ml-2">({searchResults.searchTime}ms)</span>
                  )}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  "{query}" için sonuç bulunamadı
                </p>
              )}
            </div>

            {/* View Controls */}
            {hasResults && (
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-input rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Filters Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(hasActiveFilters && 'border-primary')}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtreler
                  {hasActiveFilters && (
                    <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 p-3 bg-muted/30 rounded-md">
            <span className="text-sm font-medium">Aktif filtreler:</span>
            
            {currentParams.categories?.map(category => (
              <Button
                key={category}
                variant="secondary"
                size="sm"
                onClick={() => handleFilterChange('categories', 
                  currentParams.categories?.filter(c => c !== category) || []
                )}
                className="h-6 text-xs"
              >
                Kategori: {category}
                <X className="w-3 h-3 ml-1" />
              </Button>
            ))}

            {currentParams.brands?.map(brand => (
              <Button
                key={brand}
                variant="secondary"
                size="sm"
                onClick={() => handleFilterChange('brands', 
                  currentParams.brands?.filter(b => b !== brand) || []
                )}
                className="h-6 text-xs"
              >
                Marka: {brand}
                <X className="w-3 h-3 ml-1" />
              </Button>
            ))}

            {(currentParams.minPrice !== undefined || currentParams.maxPrice !== undefined) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  handleFilterChange('minPrice', undefined)
                  handleFilterChange('maxPrice', undefined)
                }}
                className="h-6 text-xs"
              >
                Fiyat: {currentParams.minPrice || 0}₺ - {currentParams.maxPrice || '∞'}₺
                <X className="w-3 h-3 ml-1" />
              </Button>
            )}

            {currentParams.inStockOnly && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleFilterChange('inStockOnly', false)}
                className="h-6 text-xs"
              >
                Sadece Stokta Olanlar
                <X className="w-3 h-3 ml-1" />
              </Button>
            )}

            {currentParams.minRating !== undefined && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleFilterChange('minRating', undefined)}
                className="h-6 text-xs"
              >
                Puan: {currentParams.minRating}+ yıldız
                <X className="w-3 h-3 ml-1" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
            >
              Tümünü Temizle
            </Button>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-muted/20 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Brand Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Marka</label>
                <div className="space-y-2">
                  {['Apple', 'Samsung', 'Monster', 'Asus', 'HP'].map(brand => (
                    <label key={brand} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={currentParams.brands?.includes(brand) || false}
                        onChange={(e) => {
                          const currentBrands = currentParams.brands || []
                          if (e.target.checked) {
                            handleFilterChange('brands', [...currentBrands, brand])
                          } else {
                            handleFilterChange('brands', currentBrands.filter(b => b !== brand))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Kategori</label>
                <div className="space-y-2">
                  {['Elektronik', 'Bilgisayar', 'Telefon', 'Kitap', 'Giyim'].map(category => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={currentParams.categories?.includes(category) || false}
                        onChange={(e) => {
                          const currentCategories = currentParams.categories || []
                          if (e.target.checked) {
                            handleFilterChange('categories', [...currentCategories, category])
                          } else {
                            handleFilterChange('categories', currentCategories.filter(c => c !== category))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Fiyat Aralığı (₺)</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min fiyat"
                    value={currentParams.minPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      handleFilterChange('minPrice', value ? parseFloat(value) : undefined)
                    }}
                    className="w-full px-2 py-1 text-sm border border-input rounded"
                  />
                  <input
                    type="number"
                    placeholder="Max fiyat"
                    value={currentParams.maxPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      handleFilterChange('maxPrice', value ? parseFloat(value) : undefined)
                    }}
                    className="w-full px-2 py-1 text-sm border border-input rounded"
                  />
                </div>
              </div>

              {/* Other Filters */}
              <div>
                <label className="text-sm font-medium mb-2 block">Diğer</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={currentParams.inStockOnly || false}
                      onChange={(e) => handleFilterChange('inStockOnly', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Sadece Stokta Olanlar</span>
                  </label>
                  <div>
                    <label className="text-xs text-muted-foreground">Min Puan</label>
                    <select
                      value={currentParams.minRating || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        handleFilterChange('minRating', value ? parseFloat(value) : undefined)
                      }}
                      className="w-full px-2 py-1 text-sm border border-input rounded mt-1"
                    >
                      <option value="">Tümü</option>
                      <option value="4">4+ Yıldız</option>
                      <option value="3">3+ Yıldız</option>
                      <option value="2">2+ Yıldız</option>
                      <option value="1">1+ Yıldız</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Arama Hatası</h3>
          <p className="text-muted-foreground mb-4">
            Arama gerçekleştirilemedi. Lütfen tekrar deneyin.
          </p>
          <Button onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </div>
      )}

      {/* Search Results */}
      {!error && hasResults && (
        <div>
          <ProductGrid
            products={products}
            loading={isLoading}
            error={null}
            variant={viewMode === 'grid' ? 'default' : 'compact'}
            columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Önceki
                </Button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                  if (pageNum > totalPages) return null

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results Fallback */}
      {showFallback && (
        <div className="text-center py-12">
          <div className="mb-8">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
            <p className="text-muted-foreground mb-4">
              "{query}" ile eşleşen ürün bulamadık. Arama terimlerinizi ayarlayın veya aşağıdaki vitrin ürünlerimize göz atın.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => handleSearch('')}
              >
                Aramayı Temizle
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                Tüm Ürünlere Göz At
              </Button>
            </div>
          </div>

          {/* Featured Products */}
          <div>
            <div className="flex items-center justify-center mb-6">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Vitrin Ürünleri</h3>
            </div>
            
            <ProductGrid
              products={fallbackProducts}
              loading={fallbackLoading}
              error={null}
              emptyMessage="Vitrin ürünü mevcut değil"
              variant="featured"
              columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !products.length && (
        <div className="py-12">
          <ProductGrid
            products={[]}
            loading={true}
            error={null}
            columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
          />
        </div>
      )}
    </div>
  )
}

export default SearchResultsPage