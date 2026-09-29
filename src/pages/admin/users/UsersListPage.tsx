import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { DataTable } from '../../../components/shared/DataTable'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select'
import { usePagination } from '../../../hooks/usePagination'
import { usersService } from '../../../services/users.service'
import { Role } from '../../../utils/permissions'
import { formatDate } from '../../../utils/formatters'
import type { UserListItem } from '../../../types/user'

const ROLE_OPTIONS = [
  { value: '', label: 'Todos los roles' },
  ...Object.values(Role).map((role) => ({ value: role, label: role })),
]

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
]

export function UsersListPage() {
  const navigate = useNavigate()
  const { page, limit, setPage } = usePagination()
  const [role, setRole] = useState('')
  const [isActive, setIsActive] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, limit, role, isActive }],
    queryFn: () =>
      usersService.list({
        page,
        limit,
        role: role || undefined,
        is_active: isActive || undefined,
      }),
  })

  return (
    <PageWrapper title="Usuarios" actions={<Button onClick={() => navigate('/admin/users/new')}>Nuevo usuario</Button>}>
      <div className="flex gap-3">
        <div className="w-48">
          <Select options={ROLE_OPTIONS} value={role} onChange={(e) => { setRole(e.target.value); setPage(1) }} />
        </div>
        <div className="w-40">
          <Select
            options={STATUS_OPTIONS}
            value={isActive}
            onChange={(e) => { setIsActive(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      <DataTable<UserListItem>
        isLoading={isLoading}
        rows={data?.data ?? []}
        getRowKey={(row) => row.id}
        page={data?.meta.page ?? page}
        totalPages={data?.meta.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No hay usuarios"
        columns={[
          { header: 'Email', render: (row) => row.email },
          { header: 'Nombre', render: (row) => row.full_name },
          { header: 'Rol', render: (row) => row.role },
          {
            header: 'Estado',
            render: (row) => (
              <span className={row.is_active ? 'text-green-700' : 'text-gray-400'}>
                {row.is_active ? 'Activo' : 'Inactivo'}
              </span>
            ),
          },
          { header: 'Creado', render: (row) => formatDate(row.created_at) },
          {
            header: '',
            render: (row) => (
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => navigate(`/admin/users/${row.id}`)}
              >
                Editar
              </button>
            ),
          },
        ]}
      />
    </PageWrapper>
  )
}
