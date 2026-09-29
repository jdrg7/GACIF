import { useState } from 'react'

export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  return { page, limit, setPage, setLimit }
}
