import type { ReactNode } from 'react'
import { PageWrapper } from '../layout/PageWrapper'
import { DataTable } from '../shared/DataTable'
import { Button } from '../ui/Button'

interface Column<T> {
  header: string
  render: (row: T) => ReactNode
}

interface AdminListShellProps<T> {
  title: string
  newLabel?: string
  onNew?: () => void
  filters?: ReactNode
  rows: T[]
  isLoading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  columns: Column<T>[]
  getRowKey: (row: T) => string
  emptyMessage?: string
}

export function AdminListShell<T>({
  title,
  newLabel = 'Nuevo',
  onNew,
  filters,
  rows,
  isLoading,
  page,
  totalPages,
  onPageChange,
  columns,
  getRowKey,
  emptyMessage,
}: AdminListShellProps<T>) {
  return (
    <PageWrapper title={title} actions={onNew && <Button onClick={onNew}>{newLabel}</Button>}>
      {filters && <div className="flex flex-wrap gap-3">{filters}</div>}
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={getRowKey}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        emptyMessage={emptyMessage}
      />
    </PageWrapper>
  )
}
