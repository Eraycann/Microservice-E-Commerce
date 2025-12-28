/**
 * Products Page
 * 
 * Main products listing page with advanced filtering, sorting, and search
 * Uses SearchService backend API with comprehensive filter options
 */

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { searchService } from '@/services/searchService'
import { brandService } from '@/services/brandService'
import { categoryService } from '@/services/categoryService'
import { ProductCard } from '@/components/product/ProductCard'
import { SearchBar } from '@/components/search/SearchBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '../components/ui/checkbox'
import { 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  Loader2,
  AlertTriangle,
  X
} from 'lucide-react'

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll('category') || []
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.getAll('brand') || []
  )
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '')
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance')

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams()
    
    if (searchQuery) newParams.set('q', searchQuery)
    selectedCategories.forEach(cat => newParams.append('category', cat))
    selectedBrands.forEach(brand => newParams.append('brand', brand))
    if (minPrice) newParams.set('minPrice', minPrice)
    if (maxPrice) newParams.set('maxPrice', maxPrice)
    if (inStockOnly) newParams.set('inStock', 'true')
    if (sortBy !== 'relevance') newParams.set('sort', sortBy)
    
    setSearchParams(newParams)
  }, [searchQuery, selectedCategories, selectedBrands, minPrice, maxPrice, inStockOnly, sortBy, setSearchParams])

  // Fetch available categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  // Fetch available brands
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandService.getAllBrands(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  // Fetch products using SearchService with filters
  const {
    data: products,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['search-products', searchQuery, selectedCategories, selectedBrands, minPrice, maxPrice, inStockOnly, sortBy],
    queryFn: async () => {
      console.log('[ProductsPage] Fetching products with filters:', {
        query: searchQuery,
        categories: selectedCategories,
        brands: selectedBrands,
        minPrice,
        maxPrice,
        inStockOnly,
        sort: sortBy
      })

      // If no filters applied, get all products
      if (!searchQuery && selectedCategories.length === 0 && selectedBrands.length === 0 && 
          !minPrice && !maxPrice && !inStockOnly) {
        const results = await searchService.search()
        return results.map(p => searchService.convertToProduct(p))
      }

      // Use filter endpoint for any filtering
      const filters = {
        query: searchQuery || undefined,
        category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
        brand: selectedBrands.length > 0 ? selectedBrands[0] : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      }

      let results = await searchService.filterProducts(filters)
      
      // Apply client-side filtering for multiple categories/brands
      if (selectedCategories.length > 1) {
        results = results.filter(product => 
          selectedCategories.includes(product.category)
        )
      }

      if (selectedBrands.length > 1) {
        results = results.filter(product => 
          selectedBrands.includes(product.brand)
        )
      }

      // Filter by stock status
      if (inStockOnly) {
        results = results.filter(product => product.active && (product.stockQuantity || 0) > 0)
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_asc':
          results.sort((a, b) => a.price - b.price)
          break
        case 'price_desc':
          results.sort((a, b) => b.price - a.price)
          break
        case 'name_asc':
          results.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'name_desc':
          results.sort((a, b) => b.name.localeCompare(a.name))
          break
        case 'featured':
          results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
          break
        default: // relevance - keep original order
          break
      }

      return results.map(p => searchService.convertToProduct(p))
    },
    enabled: true,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Handle category filter
  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryName])
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== categoryName))
    }
  }

  // Handle brand filter
  const handleBrandChange = (brandName: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands(prev => [...prev, brandName])
    } else {
      setSelectedBrands(prev => prev.filter(b => b !== brandName))
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedBrands([])
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
    setSortBy('relevance')
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || selectedBrands.length > 0 || 
    minPrice || maxPrice || inStockOnly || sortBy !== 'relevance'

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with Search */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
          <div className="flex-1">
            <SearchBar
              initialQuery={searchQuery}
              onSearch={handleSearch}
              size="lg"
              placeholder="Ürün ara..."
            />
          </div>
        </div>

        {/* Results Info and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {isLoading ? (
              <p className="text-muted-foreground">Ürünler yükleniyor...</p>
            ) : products ? (
              <p className="text-muted-foreground">
                {searchQuery && `"${searchQuery}" için `}
                {products.length} ürün bulundu
              </p>
            ) : (
              <p className="text-muted-foreground">Ürün bulunamadı</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="relevance">İlgililik</option>
              <option value="price_asc">Fiyat: Düşük → Yüksek</option>
              <option value="price_desc">Fiyat: Yüksek → Düşük</option>
              <option value="name_asc">İsim: A → Z</option>
              <option value="name_desc">İsim: Z → A</option>
              <option value="featured">Vitrin Ürünleri</option>
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
              className={hasActiveFilters ? 'border-primary' : ''}
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
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 p-3 bg-muted/30 rounded-md">
            <span className="text-sm font-medium">Aktif filtreler:</span>
            
            {selectedCategories.map(category => (
              <Button
                key={category}
                variant="secondary"
                size="sm"
                onClick={() => handleCategoryChange(category, false)}
                className="h-6 text-xs"
              >
                Kategori: {category}
                <X className="w-3 h-3 ml-1" />
              </Button>
            ))}

            {selectedBrands.map(brand => (
              <Button
                key={brand}
                variant="secondary"
                size="sm"
                onClick={() => handleBrandChange(brand, false)}
                className="h-6 text-xs"
              >
                Marka: {brand}
                <X className="w-3 h-3 ml-1" />
              </Button>
            ))}

            {(minPrice || maxPrice) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setMinPrice('')
                  setMaxPrice('')
                }}
                className="h-6 text-xs"
              >
                Fiyat: {minPrice || 0}₺ - {maxPrice || '∞'}₺
                <X className="w-3 h-3 ml-1" />
              </Button>
            )}

            {inStockOnly && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInStockOnly(false)}
                className="h-6 text-xs"
              >
                Sadece Stokta Olanlar
                <X className="w-3 h-3 ml-1" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
            >
              Tümünü Temizle
            </Button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-muted/20 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Categories Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Kategoriler</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={(checked: boolean) => 
                          handleCategoryChange(category.name, checked)
                        }
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Markalar</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {brands.map(brand => (
                    <label key={brand.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedBrands.includes(brand.name)}
                        onCheckedChange={(checked: boolean) => 
                          handleBrandChange(brand.name, checked)
                        }
                      />
                      <span className="text-sm">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Fiyat Aralığı (₺)</label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min fiyat"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max fiyat"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Other Filters */}
              <div>
                <label className="text-sm font-medium mb-2 block">Diğer</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={inStockOnly}
                      onCheckedChange={(checked: boolean) => setInStockOnly(checked)}
                    />
                    <span className="text-sm">Sadece Stokta Olanlar</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Ürünler yüklenirken hata oluştu</h3>
          <p className="text-muted-foreground mb-4">
            Lütfen tekrar deneyin.
          </p>
          <Button onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!error && !isLoading && products && (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 max-w-4xl mx-auto'
        }`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant={viewMode === 'list' ? 'featured' : 'default'}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {!error && !isLoading && (!products || products.length === 0) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? 'Ürün bulunamadı' : 'Henüz ürün yok'}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? `"${searchQuery}" için sonuç bulunamadı. Farklı anahtar kelimeler deneyin.`
              : 'Yakında ürünler eklenecek.'
            }
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Ürünler yükleniyor...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsPage