/**
 * Search-related TypeScript interfaces and types
 * 
 * These types define the structure for search operations, results,
 * suggestions, and faceted search functionality.
 */

import type { Product } from './product'

/**
 * Search query parameters for the search API
 */
export interface SearchParams {
  /** Search query string */
  q?: string
  /** Page number for pagination (1-based) */
  page?: number
  /** Number of results per page */
  size?: number
  /** Sort field and direction */
  sort?: string
  /** Category filters */
  categories?: string[]
  /** Brand filters */
  brands?: string[]
  /** Price range filters */
  minPrice?: number
  maxPrice?: number
  /** In stock only filter */
  inStockOnly?: boolean
  /** Minimum rating filter */
  minRating?: number
  /** Tag filters */
  tags?: string[]
}

/**
 * Search facet for filtering results
 */
export interface SearchFacet {
  /** Facet key (e.g., 'category', 'brand') */
  key: string
  /** Display name for the facet */
  name: string
  /** Available facet values */
  values: SearchFacetValue[]
}

/**
 * Individual facet value with count
 */
export interface SearchFacetValue {
  /** Facet value (e.g., category ID, brand name) */
  value: string
  /** Display label for the value */
  label: string
  /** Number of products matching this facet value */
  count: number
  /** Whether this facet value is currently selected */
  selected?: boolean
}

/**
 * Search results response from the API
 */
export interface SearchResponse {
  /** Array of matching products */
  products: Product[]
  /** Total number of matching products */
  totalElements: number
  /** Total number of pages */
  totalPages: number
  /** Current page number (0-based from API) */
  currentPage: number
  /** Number of results per page */
  pageSize: number
  /** Whether this is the first page */
  first: boolean
  /** Whether this is the last page */
  last: boolean
  /** Available facets for filtering */
  facets: SearchFacet[]
  /** Search query that was executed */
  query?: string
  /** Search execution time in milliseconds */
  searchTime?: number
}

/**
 * Search suggestion item
 */
export interface SearchSuggestion {
  /** Suggested search term */
  text: string
  /** Type of suggestion (query, product, category, brand) */
  type: 'query' | 'product' | 'category' | 'brand'
  /** Optional additional data for the suggestion */
  data?: {
    /** Product ID if type is 'product' */
    productId?: string
    /** Category ID if type is 'category' */
    categoryId?: string
    /** Brand ID if type is 'brand' */
    brandId?: string
    /** Number of results for this suggestion */
    resultCount?: number
  }
}

/**
 * Search suggestions response from the API
 */
export interface SearchSuggestionsResponse {
  /** Array of search suggestions */
  suggestions: SearchSuggestion[]
  /** Query that was used to generate suggestions */
  query: string
}

/**
 * Recent search item stored in localStorage
 */
export interface RecentSearch {
  /** Search query */
  query: string
  /** Timestamp when the search was performed */
  timestamp: number
  /** Number of results found */
  resultCount?: number
}

/**
 * Search history management interface
 */
export interface SearchHistory {
  /** Recent searches (max 5) */
  recent: RecentSearch[]
}

/**
 * Search filter state for URL management
 */
export interface SearchFilters {
  /** Selected categories */
  categories: string[]
  /** Selected brands */
  brands: string[]
  /** Minimum price */
  minPrice?: number
  /** Maximum price */
  maxPrice?: number
  /** In stock only */
  inStockOnly: boolean
  /** Minimum rating */
  minRating?: number
  /** Selected tags */
  tags: string[]
  /** Sort option */
  sort: string
}

/**
 * Search state for the search results page
 */
export interface SearchState {
  /** Current search query */
  query: string
  /** Current filters */
  filters: SearchFilters
  /** Current page */
  page: number
  /** Results per page */
  pageSize: number
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: string | null
  /** Search results */
  results: SearchResponse | null
}