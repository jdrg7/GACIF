import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { AdminListShell } from '../../../components/admin/AdminListShell'
import { Input } from '../../../components/ui/Input'
import { usePagination } from '../../../hooks/usePagination'
import { usePermissions } from '../../../hooks/usePermissions'
import { customsAgentsService } from '../../../services/master-data/customs-agents.service'
import { Permission } from '../../../utils/permissions'
import type { CustomsAgent } from '../../../types/master-data'

export function CustomsAgentsListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const { page, limit, setPage } = usePagination()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['customs-agents', { page, limit, search }],
    queryFn: () => customsAgentsService.list({ page, limit, search: search || undefined }),
  })

  const canEdit = hasPermission(Permission.MASTER_DATA_EDIT)

  return (
    <AdminListShell<CustomsAgent>
      title="Agentes aduaneros"
      onNew={canEdit ? () => navigate('/admin/customs-agents/new') : undefined}
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
      emptyMessage="No hay agentes aduaneros"
      columns={[
        { header: 'Nombre', render: (row) => row.name },
        { header: 'Licencia', render: (row) => row.license_number ?? '—' },
        { header: 'Email', render: (row) => row.email ?? '—' },
        {
          header: 'Estado',
          render: (row) => <span className={row.is_active ? 'text-green-700' : 'text-gray-400'}>{row.is_active ? 'Activo' : 'Inactivo'}</span>,
        },
        {
          header: '',
          render: (row) => (
            <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate(`/admin/customs-agents/${row.id}`)}>
              {canEdit ? 'Editar' : 'Ver'}
            </button>
          ),
        },
      ]}
    />
  )
}
