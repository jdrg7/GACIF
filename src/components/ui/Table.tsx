import type { ReactNode } from 'react'

interface Column<T> {
  header: string
  render: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string
}

export function Table<T>({ columns, rows, getRowKey }: TableProps<T>) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left text-gray-500">
          {columns.map((column) => (
            <th key={column.header} className="px-3 py-2 font-medium">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowKey(row)} className="border-b border-gray-100">
            {columns.map((column) => (
              <td key={column.header} className="px-3 py-2">
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
