import { Button } from '../ui/Button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">
        Página {page} de {totalPages || 1}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </Button>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
