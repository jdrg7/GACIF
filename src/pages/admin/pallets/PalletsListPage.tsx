import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { AdminListShell } from '../../../components/admin/AdminListShell'
import { Input } from '../../../components/ui/Input'
import { usePagination } from '../../../hooks/usePagination'
import { usePermissions } from '../../../hooks/usePermissions'
import { palletsService } from '../../../services/master-data/pallets.service'
import { Permission } from '../../../utils/permissions'
import type { Pallet } from '../../../types/master-data'

export function PalletsListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const { page, limit, setPage } = usePagination()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['pallets', { page, limit, search }],
    queryFn: () => palletsService.list({ page, limit, search: search || undefined }),
  })

  const canEdit = hasPermission(Permission.MASTER_DATA_EDIT)

  return (
    <AdminListShell<Pallet>
      title="Pallets"
      onNew={canEdit ? () => navigate('/admin/pallets/new') : undefined}
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
      emptyMessage="No hay pallets"
      columns={[
        { header: 'Nombre', render: (row) => row.name },
        { header: 'Peso máx (KG)', render: (row) => row.max_weight_kg },
        { header: 'Volumen (CFT)', render: (row) => row.volume_cft },
        {
          header: 'Estado',
          render: (row) => <span className={row.is_active ? 'text-green-700' : 'text-gray-400'}>{row.is_active ? 'Activo' : 'Inactivo'}</span>,
        },
        {
          header: '',
          render: (row) => (
            <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate(`/admin/pallets/${row.id}`)}>
              {canEdit ? 'Editar' : 'Ver'}
            </button>
          ),
        },
      ]}
    />
  )
}
