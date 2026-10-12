import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { DataTable } from '../../components/shared/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { usePagination } from '../../hooks/usePagination'
import { usePermissions } from '../../hooks/usePermissions'
import { quotationsService } from '../../services/quotations.service'
import { QuotationStatus } from '../../utils/constants'
import { Permission } from '../../utils/permissions'
import { formatCurrency, formatDate } from '../../utils/formatters'
import type { Quotation } from '../../types/quotation'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  ...Object.values(QuotationStatus).map((status) => ({ value: status, label: status })),
]

export function QuotationsListPage() {
  const navigate = useNavigate()
  const { hasAnyPermission } = usePermissions()
  const { page, limit, setPage } = usePagination()
  const [status, setStatus] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['quotations', { page, limit, status }],
    queryFn: () => quotationsService.list({ page, limit, status: status || undefined }),
  })

  const canCreate = hasAnyPermission([Permission.QUOTATION_CREATE, Permission.QUOTATION_CREATE_DRAFT])

  return (
    <PageWrapper
      title="Cotizaciones"
      actions={canCreate && <Button onClick={() => navigate('/quotations/new')}>Nueva cotización</Button>}
    >
      <div className="w-56">
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <DataTable<Quotation>
        isLoading={isLoading}
        rows={data?.data ?? []}
        getRowKey={(row) => row.id}
        page={data?.meta.page ?? page}
        totalPages={data?.meta.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No hay cotizaciones"
        columns={[
          { header: 'Referencia', render: (row) => row.reference_number },
          { header: 'Estado', render: (row) => <Badge status={row.status} /> },
          { header: 'Transporte', render: (row) => row.transport_type },
          { header: 'Total', render: (row) => formatCurrency(Number(row.total_cost)) },
          { header: 'Venta', render: (row) => formatCurrency(Number(row.sale_price)) },
          { header: 'Creada', render: (row) => formatDate(row.created_at) },
          {
            header: '',
            render: (row) => (
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => navigate(`/quotations/${row.id}`)}
              >
                Ver
              </button>
            ),
          },
        ]}
      />
    </PageWrapper>
  )
}
