import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { AdminListShell } from '../../../components/admin/AdminListShell'
import { usePagination } from '../../../hooks/usePagination'
import { usePermissions } from '../../../hooks/usePermissions'
import { exchangeRatesService } from '../../../services/master-data/exchange-rates.service'
import { currenciesService } from '../../../services/master-data/currencies.service'
import { Permission } from '../../../utils/permissions'
import { formatDate } from '../../../utils/formatters'
import type { ExchangeRate } from '../../../types/master-data'

export function ExchangeRatesListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const { page, limit, setPage } = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['exchange-rates', { page, limit }],
    queryFn: () => exchangeRatesService.list({ page, limit }),
  })
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => currenciesService.list() })
  const codeById = new Map((currencies ?? []).map((c) => [c.id, c.code]))

  const canCreate = hasPermission(Permission.EXCHANGE_RATE_EDIT)

  return (
    <AdminListShell<ExchangeRate>
      title="Tipos de cambio"
      onNew={canCreate ? () => navigate('/admin/exchange-rates/new') : undefined}
      newLabel="Nuevo tipo de cambio"
      rows={data?.data ?? []}
      isLoading={isLoading}
      page={data?.meta.page ?? page}
      totalPages={data?.meta.totalPages ?? 1}
      onPageChange={setPage}
      getRowKey={(row) => row.id}
      emptyMessage="No hay tipos de cambio registrados"
      columns={[
        { header: 'De', render: (row) => codeById.get(row.from_currency_id) ?? '—' },
        { header: 'A', render: (row) => codeById.get(row.to_currency_id) ?? '—' },
        { header: 'Tasa', render: (row) => row.rate },
        { header: 'Fecha', render: (row) => formatDate(row.date) },
      ]}
    />
  )
}
