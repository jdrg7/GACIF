import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { AdminListShell } from '../../../components/admin/AdminListShell'
import { usePagination } from '../../../hooks/usePagination'
import { usePermissions } from '../../../hooks/usePermissions'
import { countriesService } from '../../../services/master-data/countries.service'
import { currenciesService } from '../../../services/master-data/currencies.service'
import { Permission } from '../../../utils/permissions'
import type { Country } from '../../../types/master-data'

export function CountriesListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const { page, limit, setPage } = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['countries', { page, limit }],
    queryFn: () => countriesService.list({ page, limit }),
  })
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => currenciesService.list() })
  const currencyCodeById = new Map((currencies ?? []).map((c) => [c.id, c.code]))

  const canEdit = hasPermission(Permission.COUNTRY_CONFIG_EDIT)

  return (
    <AdminListShell<Country>
      title="Países"
      onNew={canEdit ? () => navigate('/admin/countries/new') : undefined}
      rows={data?.data ?? []}
      isLoading={isLoading}
      page={data?.meta.page ?? page}
      totalPages={data?.meta.totalPages ?? 1}
      onPageChange={setPage}
      getRowKey={(row) => row.id}
      emptyMessage="No hay países"
      columns={[
        { header: 'Código', render: (row) => row.code },
        { header: 'Nombre', render: (row) => row.name },
        { header: 'Moneda', render: (row) => currencyCodeById.get(row.currency_id) ?? '—' },
        {
          header: 'Estado',
          render: (row) => <span className={row.is_active ? 'text-green-700' : 'text-gray-400'}>{row.is_active ? 'Activo' : 'Inactivo'}</span>,
        },
        {
          header: '',
          render: (row) => (
            <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate(`/admin/countries/${row.id}`)}>
              {canEdit ? 'Editar' : 'Ver'}
            </button>
          ),
        },
      ]}
    />
  )
}
