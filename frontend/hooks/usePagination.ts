import { useState } from 'react'

export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const goToPage = (newPage: number) => setPage(Math.max(1, newPage))
  const nextPage = () => setPage(p => p + 1)
  const prevPage = () => setPage(p => Math.max(1, p - 1))
  const setPageLimit = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  return {
    page,
    limit,
    goToPage,
    nextPage,
    prevPage,
    setPageLimit,
  }
}
