import type { ReactNode } from 'react'
import { Table } from '../ui/Table'
import { Pagination } from './Pagination'
import { EmptyState } from './EmptyState'
import { Spinner } from '../ui/Spinner'

interface Column<T> {
  header: string
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  isLoading?: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading,
  page,
  totalPages,
  onPageChange,
  emptyMessage = 'Sin resultados',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="flex flex-col gap-4">
      <Table columns={columns} rows={rows} getRowKey={getRowKey} />
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
