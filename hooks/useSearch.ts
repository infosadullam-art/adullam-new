// hooks/useSearch.ts
import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'

interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page?: number
}

export function useSearch(query: string, filters: SearchFilters = {}) {
  const [results, setResults] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
  const [filtersData, setFiltersData] = useState({ categories: [], priceRange: { min: 0, max: 0 } })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery && !filters.category) {
        setResults([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (debouncedQuery) params.append('q', debouncedQuery)
        if (filters.category) params.append('category', filters.category)
        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
        if (filters.sort) params.append('sort', filters.sort)
        if (filters.page) params.append('page', filters.page.toString())

        const response = await fetch(`/api/search?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setResults(data.data)
          setPagination(data.pagination)
          setFiltersData(data.filters)
        } else {
          setError(data.error)
        }
      } catch (err) {
        setError('Erreur de connexion')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery, filters])

  return { results, pagination, filters: filtersData, isLoading, error }
}