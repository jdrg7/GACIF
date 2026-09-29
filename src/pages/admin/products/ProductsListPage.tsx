import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { AdminListShell } from '../../../components/admin/AdminListShell'
import { Input } from '../../../components/ui/Input'
import { usePagination } from '../../../hooks/usePagination'
import { usePermissions } from '../../../hooks/usePermissions'
import { productsService } from '../../../services/master-data/products.service'
import { Permission } from '../../../utils/permissions'
import type { Product } from '../../../types/master-data'

export function ProductsListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const { page, limit, setPage } = usePagination()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, limit, search }],
    queryFn: () => productsService.list({ page, limit, search: search || undefined }),
  })

  const canEdit = hasPermission(Permission.MASTER_DATA_EDIT)

  return (
    <AdminListShell<Product>
      title="Productos"
      onNew={canEdit ? () => navigate('/admin/products/new') : undefined}
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
      emptyMessage="No hay productos"
      columns={[
        { header: 'Nombre', render: (row) => row.name },
        { header: 'SKU', render: (row) => row.sku ?? '—' },
        { header: 'Peso (KG)', render: (row) => row.weight_kg },
        { header: 'Volumen (CFT)', render: (row) => row.volume_cft },
        {
          header: 'Estado',
          render: (row) => <span className={row.is_active ? 'text-green-700' : 'text-gray-400'}>{row.is_active ? 'Activo' : 'Inactivo'}</span>,
        },
        {
          header: '',
          render: (row) => (
            <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate(`/admin/products/${row.id}`)}>
              {canEdit ? 'Editar' : 'Ver'}
            </button>
          ),
        },
      ]}
    />
  )
}
