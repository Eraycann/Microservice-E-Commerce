/**
 * Search Store
 * 
 * Zustand store for managing global search state including:
 * - Recent searches persistence
 * - Search suggestions caching
 * - Search filters state
 * - Search history management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { searchService } from '@/services/searchService'
import type { RecentSearch, SearchSuggestion } from '@/types/search'

interface SearchState {
  // Recent searches
  recentSearches: RecentSearch[]
  
  // Cached suggestions
  suggestionsCache: Record<string, SearchSuggestion[]>
  
  // Current search query (for cross-component state)
  currentQuery: string
  
  // Popular searches
  popularSearches: string[]
}

interface SearchActions {
  // Recent searches management
  addRecentSearch: (query: string, resultCount?: number) => void
  removeRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  
  // Suggestions caching
  cacheSuggestions: (query: string, suggestions: SearchSuggestion[]) => void
  getCachedSuggestions: (query: string) => SearchSuggestion[] | null
  
  // Current query management
  setCurrentQuery: (query: string) => void
  
  // Popular searches
  setPopularSearches: (searches: string[]) => void
  
  // Utility actions
  refreshRecentSearches: () => void
}

type SearchStore = SearchState & SearchActions

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      // Initial state
      recentSearches: [],
      suggestionsCache: {},
      currentQuery: '',
      popularSearches: [],

      // Recent searches management
      addRecentSearch: (query: string, resultCount?: number) => {
        const timestamp = Date.now()
        const newSearch: RecentSearch = { query, timestamp, resultCount }
        
        set((state) => {
          // Remove existing entry for this query
          const filtered = state.recentSearches.filter(
            search => search.query.toLowerCase() !== query.toLowerCase()
          )
          
          // Add new entry at the beginning
          const updated = [newSearch, ...filtered].slice(0, 5) // Keep max 5
          
          return { recentSearches: updated }
        })
        
        // Also update the service's localStorage
        searchService.addToSearchHistory(query, resultCount)
      },

      removeRecentSearch: (query: string) => {
        set((state) => ({
          recentSearches: state.recentSearches.filter(
            search => search.query.toLowerCase() !== query.toLowerCase()
          )
        }))
        
        // Also update the service's localStorage
        searchService.removeFromSearchHistory(query)
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] })
        searchService.clearSearchHistory()
      },

      // Suggestions caching
      cacheSuggestions: (query: string, suggestions: SearchSuggestion[]) => {
        set((state) => ({
          suggestionsCache: {
            ...state.suggestionsCache,
            [query.toLowerCase()]: suggestions
          }
        }))
      },

      getCachedSuggestions: (query: string) => {
        const cache = get().suggestionsCache
        return cache[query.toLowerCase()] || null
      },

      // Current query management
      setCurrentQuery: (query: string) => {
        set({ currentQuery: query })
      },

      // Popular searches
      setPopularSearches: (searches: string[]) => {
        set({ popularSearches: searches })
      },

      // Utility actions
      refreshRecentSearches: () => {
        const history = searchService.getSearchHistory()
        set({ recentSearches: history.recent })
      }
    }),
    {
      name: 'search-store',
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        popularSearches: state.popularSearches
      }),
      version: 1,
    }
  )
)

// Convenience hooks for specific parts of the store
export const useRecentSearches = () => {
  const recentSearches = useSearchStore((state) => state.recentSearches)
  const addRecentSearch = useSearchStore((state) => state.addRecentSearch)
  const removeRecentSearch = useSearchStore((state) => state.removeRecentSearch)
  const clearRecentSearches = useSearchStore((state) => state.clearRecentSearches)
  
  return { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches }
}

export const useSearchSuggestions = () => {
  const suggestionsCache = useSearchStore((state) => state.suggestionsCache)
  const cacheSuggestions = useSearchStore((state) => state.cacheSuggestions)
  const getCachedSuggestions = useSearchStore((state) => state.getCachedSuggestions)
  
  return { suggestionsCache, cacheSuggestions, getCachedSuggestions }
}

export const useCurrentSearch = () => {
  const currentQuery = useSearchStore((state) => state.currentQuery)
  const setCurrentQuery = useSearchStore((state) => state.setCurrentQuery)
  
  return { currentQuery, setCurrentQuery }
}

export const usePopularSearches = () => {
  const popularSearches = useSearchStore((state) => state.popularSearches)
  const setPopularSearches = useSearchStore((state) => state.setPopularSearches)
  
  return { popularSearches, setPopularSearches }
}