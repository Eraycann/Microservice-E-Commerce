/**
 * SearchBar Component
 * 
 * A comprehensive search input component with:
 * - Auto-complete suggestions with debouncing
 * - Recent search history
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Loading states and error handling
 * - Mobile-responsive design
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { searchService, SearchUtils } from '@/services/searchService'
import type { SearchSuggestion, RecentSearch } from '@/types/search'
import { 
  Search, 
  Clock, 
  TrendingUp, 
  X, 
  Loader2,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchBarProps {
  /** Initial search query */
  initialQuery?: string
  /** Placeholder text */
  placeholder?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show suggestions dropdown */
  showSuggestions?: boolean
  /** Whether to auto-focus on mount */
  autoFocus?: boolean
  /** Custom className */
  className?: string
  /** Callback when search is performed */
  onSearch?: (query: string) => void
}

/**
 * Custom hook for debounced search suggestions
 */
// Removed - using store-based caching instead

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  placeholder = 'Ürün ara...',
  size = 'md',
  showSuggestions = true,
  autoFocus = false,
  className,
  onSearch
}) => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [query, setQuery] = useState(initialQuery)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  // Load recent searches on mount
  useEffect(() => {
    const history = searchService.getSearchHistory()
    setRecentSearches(history.recent)
  }, [])

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Debounce the query with 300ms delay
  const [debouncedQuery, setDebouncedQuery] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Fetch suggestions with debouncing
  const {
    data: suggestionsData,
    isLoading: suggestionsLoading,
    error: suggestionsError
  } = useQuery({
    queryKey: ['search', 'suggestions', debouncedQuery],
    queryFn: () => searchService.getSearchSuggestions(debouncedQuery),
    enabled: showSuggestions && isOpen && debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Combine suggestions and recent searches
  const suggestions = suggestionsData?.suggestions || []
  const showRecentSearches = query.length < 2 && recentSearches.length > 0
  
  // Convert recent searches to suggestion format
  const recentAsSuggestions: SearchSuggestion[] = recentSearches.map(recent => ({
    text: recent.query,
    type: 'query' as const,
    data: { resultCount: recent.resultCount }
  }))
  
  const allSuggestions = showRecentSearches ? recentAsSuggestions : suggestions

  // Load popular searches if no recent searches and no current suggestions
  const {
    data: popularSearches = [],
  } = useQuery({
    queryKey: ['search', 'popular'],
    queryFn: () => searchService.getPopularSearches(),
    enabled: !showRecentSearches && suggestions.length === 0 && query.length < 2,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })

  // Use popular searches as fallback when no recent searches or suggestions
  const finalSuggestions = allSuggestions.length > 0 
    ? allSuggestions 
    : popularSearches.map(search => ({
        text: search,
        type: 'query' as const,
        data: {}
      }))

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    setSelectedIndex(-1)
    
    if (newQuery.length > 0) {
      setIsOpen(true)
    }
  }

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true)
  }

  // Handle input blur (with delay to allow clicking on suggestions)
  const handleInputBlur = () => {
    setTimeout(() => {
      setIsOpen(false)
      setSelectedIndex(-1)
    }, 200)
  }

  // Perform search
  const performSearch = useCallback((searchQuery: string) => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return

    // Close dropdown
    setIsOpen(false)
    setSelectedIndex(-1)

    // Add to search history immediately
    searchService.addToSearchHistory(trimmedQuery)
    
    // Update recent searches state
    const history = searchService.getSearchHistory()
    setRecentSearches(history.recent)

    // Call onSearch callback if provided
    if (onSearch) {
      onSearch(trimmedQuery)
    } else {
      // Navigate to search results page
      const searchUrl = SearchUtils.buildSearchUrl({ q: trimmedQuery })
      navigate(searchUrl)
    }

    // Blur input on mobile
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }, [navigate, onSearch])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        if (isOpen) {
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < finalSuggestions.length - 1 ? prev + 1 : prev
          )
        }
        break

      case 'ArrowUp':
        if (isOpen) {
          e.preventDefault()
          setSelectedIndex(prev => prev > -1 ? prev - 1 : -1)
        }
        break

      case 'Enter':
        e.preventDefault()
        if (isOpen && selectedIndex >= 0 && finalSuggestions[selectedIndex]) {
          const suggestion = finalSuggestions[selectedIndex]
          setQuery(suggestion.text)
          performSearch(suggestion.text)
        } else {
          // Always perform search on Enter, even if dropdown is closed
          performSearch(query)
        }
        break

      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    performSearch(suggestion.text)
  }

  // Handle search button click
  const handleSearchClick = () => {
    performSearch(query)
  }

  // Handle clear button click
  const handleClearClick = () => {
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Size-based styling
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className={cn(
          'absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground',
          iconSizes[size]
        )} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-20 border border-input rounded-md bg-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'transition-colors',
            sizeClasses[size]
          )}
        />

        {/* Clear Button */}
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearClick}
            className={cn(
              'absolute right-10 top-1/2 transform -translate-y-1/2',
              'h-6 w-6 p-0 hover:bg-muted'
            )}
          >
            <X className="w-3 h-3" />
          </Button>
        )}

        {/* Search Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSearchClick}
          className={cn(
            'absolute right-1 top-1/2 transform -translate-y-1/2',
            'h-8 w-8 p-0 hover:bg-muted'
          )}
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {/* Loading State */}
          {suggestionsLoading && query.length >= 2 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Öneriler yükleniyor...</span>
            </div>
          )}

          {/* Error State */}
          {suggestionsError && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Öneriler yüklenemedi
            </div>
          )}

          {/* Recent Searches Header */}
          {showRecentSearches && (
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/30">
              <Clock className="w-3 h-3 inline mr-1" />
              Son Aramalar
            </div>
          )}

          {/* Suggestions List */}
          {finalSuggestions.length > 0 ? (
            <div className="py-1">
              {finalSuggestions.map((suggestion, index) => {
                const isSelected = index === selectedIndex
                const isRecent = showRecentSearches
                const isPopular = !showRecentSearches && suggestions.length === 0
                const text = suggestion.text
                const resultCount = suggestion.data && 'resultCount' in suggestion.data 
                  ? suggestion.data.resultCount 
                  : undefined

                return (
                  <button
                    key={`${text}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      'w-full px-4 py-2 text-left hover:bg-accent transition-colors',
                      'flex items-center justify-between',
                      isSelected && 'bg-accent'
                    )}
                  >
                    <div className="flex items-center">
                      {isRecent ? (
                        <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                      ) : isPopular ? (
                        <TrendingUp className="w-4 h-4 mr-3 text-muted-foreground" />
                      ) : suggestion.type === 'product' ? (
                        <TrendingUp className="w-4 h-4 mr-3 text-muted-foreground" />
                      ) : (
                        <Search className="w-4 h-4 mr-3 text-muted-foreground" />
                      )}
                      
                      <span className="text-sm">{text}</span>
                      
                      {resultCount !== undefined && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({resultCount} sonuç)
                        </span>
                      )}
                    </div>

                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          ) : (
            !suggestionsLoading && query.length >= 2 && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Öneri bulunamadı
              </div>
            )
          )}

          {/* Clear History Option */}
          {showRecentSearches && recentSearches.length > 0 && (
            <div className="border-t">
              <button
                onClick={() => {
                  searchService.clearSearchHistory()
                  setRecentSearches([])
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-xs text-muted-foreground hover:bg-accent transition-colors"
              >
                Arama geçmişini temizle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar