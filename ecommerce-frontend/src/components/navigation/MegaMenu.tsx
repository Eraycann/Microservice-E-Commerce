/**
 * Mega Menu Component
 * 
 * Navigation menu with categories and featured content
 * Uses SearchService backend for brands, fallback categories
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import { 
  ChevronDown, 
  Grid3X3, 
  Tag, 
  Star,
  TrendingUp
} from 'lucide-react'

export const MegaMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  // Fetch categories (fallback data)
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Fetch top brands (from SearchService)
  const { data: brands } = useQuery({
    queryKey: ['top-brands'],
    queryFn: () => brandService.getTopBrands(6),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const topCategories = categories?.slice(0, 8) || []
  const topBrands = brands || []

  return (
    <div className="relative bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Categories Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              <Grid3X3 className="w-4 h-4" />
              <span>Kategoriler</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Mega Menu Dropdown */}
            {isOpen && (
              <div className="absolute top-full left-0 w-screen max-w-4xl bg-white shadow-lg border border-gray-200 z-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
                  {/* Categories */}
                  <div>
                    <h3 className="flex items-center text-sm font-semibold text-gray-900 mb-4">
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Kategoriler
                    </h3>
                    <div className="space-y-2">
                      {topCategories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/products?category=${category.name}`}
                          className="block text-sm text-gray-600 hover:text-primary transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                      <Link
                        to="/products"
                        className="block text-sm text-primary font-medium hover:underline mt-4"
                      >
                        Tüm Ürünler →
                      </Link>
                    </div>
                  </div>

                  {/* Brands */}
                  <div>
                    <h3 className="flex items-center text-sm font-semibold text-gray-900 mb-4">
                      <Tag className="w-4 h-4 mr-2" />
                      Popüler Markalar
                    </h3>
                    <div className="space-y-2">
                      {topBrands.map((brand) => (
                        <Link
                          key={brand.id}
                          to={`/products?brand=${brand.name}`}
                          className="block text-sm text-gray-600 hover:text-primary transition-colors"
                        >
                          {brand.name}
                        </Link>
                      ))}
                      <Link
                        to="/products"
                        className="block text-sm text-primary font-medium hover:underline mt-4"
                      >
                        Tüm Markalar →
                      </Link>
                    </div>
                  </div>

                  {/* Featured Links */}
                  <div>
                    <h3 className="flex items-center text-sm font-semibold text-gray-900 mb-4">
                      <Star className="w-4 h-4 mr-2" />
                      Öne Çıkanlar
                    </h3>
                    <div className="space-y-2">
                      <Link
                        to="/products?featured=true"
                        className="block text-sm text-gray-600 hover:text-primary transition-colors"
                      >
                        Vitrin Ürünleri
                      </Link>
                      <Link
                        to="/products?sort=bestsellers"
                        className="flex items-center text-sm text-gray-600 hover:text-primary transition-colors"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Çok Satanlar
                      </Link>
                      <Link
                        to="/products"
                        className="block text-sm text-gray-600 hover:text-primary transition-colors"
                      >
                        Tüm Ürünler
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Bottom Banner */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">500 TL</span> ve üzeri alışverişlerde 
                      <span className="font-medium text-green-600 ml-1">ücretsiz kargo!</span>
                    </div>
                    <Link
                      to="/products"
                      className="text-sm text-primary font-medium hover:underline"
                    >
                      Tüm Ürünleri Görüntüle →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/products?featured=true"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Vitrin
            </Link>
            <Link
              to="/products?sort=bestsellers"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Çok Satan
            </Link>
            <Link
              to="/products"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Tüm Ürünler
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}