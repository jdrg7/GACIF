import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { AdminListShell } from '../../../components/admin/AdminListShell'
import { Input } from '../../../components/ui/Input'
import { usePagination } from '../../../hooks/usePagination'
import { usePermissions } from '../../../hooks/usePermissions'
import { clientsService } from '../../../services/master-data/clients.service'
import { countriesService } from '../../../services/master-data/countries.service'
import { Permission } from '../../../utils/permissions'
import type { Client } from '../../../types/master-data'

export function ClientsListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const { page, limit, setPage } = usePagination()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['clients', { page, limit, search }],
    queryFn: () => clientsService.list({ page, limit, search: search || undefined }),
  })
  const { data: countries } = useQuery({ queryKey: ['countries', { limit: 100 }], queryFn: () => countriesService.list({ limit: 100 }) })
  const countryNameById = new Map((countries?.data ?? []).map((c) => [c.id, c.name]))

  const canEdit = hasPermission(Permission.MASTER_DATA_EDIT)

  return (
    <AdminListShell<Client>
      title="Clientes"
      onNew={canEdit ? () => navigate('/admin/clients/new') : undefined}
      filters={
        <div className="w-64">
          <Input placeholder="Buscar por nombre..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
      }
      rows={data?.data ?? []}
      isLoading={isLoading}
      page={data?.meta.page ?? page}
      totalPages={data?.meta.totalPages ?? 1}
      onPageChange={setPage}
      getRowKey={(row) => row.id}
      emptyMessage="No hay clientes"
      columns={[
        { header: 'Nombre', render: (row) => row.name },
        { header: 'País', render: (row) => countryNameById.get(row.country_id) ?? '—' },
        { header: 'RTN/NIT', render: (row) => row.tax_id ?? '—' },
        {
          header: 'Estado',
          render: (row) => <span className={row.is_active ? 'text-green-700' : 'text-gray-400'}>{row.is_active ? 'Activo' : 'Inactivo'}</span>,
        },
        {
          header: '',
          render: (row) => (
            <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate(`/admin/clients/${row.id}`)}>
              {canEdit ? 'Editar' : 'Ver'}
            </button>
          ),
        },
      ]}
    />
  )
}
