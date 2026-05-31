import { useState, useCallback, useEffect } from 'react'

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const clear = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
  }, [])

  return { query, setQuery, debouncedQuery, clear }
}
