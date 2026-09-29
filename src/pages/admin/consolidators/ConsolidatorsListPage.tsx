import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { AdminListShell } from '../../../components/admin/AdminListShell'
import { Input } from '../../../components/ui/Input'
import { usePagination } from '../../../hooks/usePagination'
import { usePermissions } from '../../../hooks/usePermissions'
import { consolidatorsService } from '../../../services/master-data/consolidators.service'
import { Permission } from '../../../utils/permissions'
import type { Consolidator } from '../../../types/master-data'

export function ConsolidatorsListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const { page, limit, setPage } = usePagination()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['consolidators', { page, limit, search }],
    queryFn: () => consolidatorsService.list({ page, limit, search: search || undefined }),
  })

  const canEdit = hasPermission(Permission.MASTER_DATA_EDIT)

  return (
    <AdminListShell<Consolidator>
      title="Consolidadores"
      onNew={canEdit ? () => navigate('/admin/consolidators/new') : undefined}
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
      emptyMessage="No hay consolidadores"
      columns={[
        { header: 'Nombre', render: (row) => row.name },
        { header: 'Email', render: (row) => row.email ?? '—' },
        { header: 'Teléfono', render: (row) => row.phone ?? '—' },
        {
          header: 'Estado',
          render: (row) => <span className={row.is_active ? 'text-green-700' : 'text-gray-400'}>{row.is_active ? 'Activo' : 'Inactivo'}</span>,
        },
        {
          header: '',
          render: (row) => (
            <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate(`/admin/consolidators/${row.id}`)}>
              {canEdit ? 'Editar' : 'Ver'}
            </button>
          ),
        },
      ]}
    />
  )
}
