import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import axios from 'axios'
import { PageWrapper } from '../../../components/layout/PageWrapper'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Spinner } from '../../../components/ui/Spinner'
import { ResetPasswordModal } from '../../../components/user/ResetPasswordModal'
import { PermissionsPanel } from '../../../components/user/PermissionsPanel'
import { usePermissions } from '../../../hooks/usePermissions'
import { usersService } from '../../../services/users.service'
import { Permission, Role } from '../../../utils/permissions'
import { createUserSchema, editUserSchema, type CreateUserFormValues, type EditUserFormValues } from './user.schema'

const ROLE_OPTIONS = Object.values(Role).map((role) => ({ value: role, label: role }))

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
    return error.response.data.error.message
  }
  return fallback
}

export function UserFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isResetModalOpen, setResetModalOpen] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersService.getById(id!),
    enabled: isEdit,
  })

  const createForm = useForm<CreateUserFormValues>({ resolver: zodResolver(createUserSchema) })
  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    values: user ? { full_name: user.full_name, role: user.role, is_active: user.is_active } : undefined,
  })

  const createMutation = useMutation({
    mutationFn: (values: CreateUserFormValues) => usersService.create(values),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate(`/admin/users/${created.id}`, { replace: true })
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo crear el usuario')),
  })

  const updateMutation = useMutation({
    mutationFn: (values: EditUserFormValues) => usersService.update(id!, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(['users', id], updated)
      queryClient.invalidateQueries({ queryKey: ['users'], exact: false })
      setServerError(null)
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo actualizar el usuario')),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (newPassword: string) => usersService.resetPassword(id!, newPassword),
    onSuccess: () => {
      setResetModalOpen(false)
      setResetError(null)
    },
    onError: (error) => setResetError(extractErrorMessage(error, 'No se pudo restablecer la contraseña')),
  })

  const permissionMutation = useMutation({
    mutationFn: ({ permission, grant }: { permission: Permission; grant: boolean }) =>
      grant ? usersService.grantPermission(id!, permission) : usersService.revokePermission(id!, permission),
    onSuccess: (updated) => {
      queryClient.setQueryData(['users', id], updated)
      setPermissionError(null)
    },
    onError: (error) => setPermissionError(extractErrorMessage(error, 'No se pudo actualizar el permiso')),
  })

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <PageWrapper title={isEdit ? user?.email ?? 'Usuario' : 'Nuevo usuario'}>
      {isEdit ? (
        <form onSubmit={editForm.handleSubmit((values) => updateMutation.mutate(values))} className="flex max-w-md flex-col gap-4">
          <Input label="Email" value={user?.email ?? ''} disabled />
          <Input
            label="Nombre completo"
            error={editForm.formState.errors.full_name?.message}
            {...editForm.register('full_name')}
          />
          <Select label="Rol" options={ROLE_OPTIONS} {...editForm.register('role')} />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...editForm.register('is_active')} />
            Usuario activo
          </label>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => setResetModalOpen(true)}>
              Restablecer contraseña
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/users')}>
                Volver
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <form
          onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
          className="flex max-w-md flex-col gap-4"
        >
          <Input label="Email" type="email" error={createForm.formState.errors.email?.message} {...createForm.register('email')} />
          <Input
            label="Contraseña"
            type="password"
            error={createForm.formState.errors.password?.message}
            {...createForm.register('password')}
          />
          <Input
            label="Nombre completo"
            error={createForm.formState.errors.full_name?.message}
            {...createForm.register('full_name')}
          />
          <Select label="Rol" options={ROLE_OPTIONS} {...createForm.register('role')} />

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/users')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      )}

      {isEdit && user && hasPermission(Permission.ROLE_MANAGE) && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-700">Permisos</h3>
          {permissionError && <p className="mb-2 text-sm text-red-600">{permissionError}</p>}
          <PermissionsPanel
            role={user.role}
            grantedPermissions={user.permissions}
            isPending={permissionMutation.isPending}
            onToggle={(permission, grant) => permissionMutation.mutate({ permission, grant })}
          />
        </div>
      )}

      {isEdit && (
        <ResetPasswordModal
          isOpen={isResetModalOpen}
          onClose={() => setResetModalOpen(false)}
          isSubmitting={resetPasswordMutation.isPending}
          error={resetError}
          onConfirm={(newPassword) => resetPasswordMutation.mutate(newPassword)}
        />
      )}
    </PageWrapper>
  )
}
