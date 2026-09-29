import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import axios from 'axios'
import { AdminFormShell } from '../../../components/admin/AdminFormShell'
import { FieldRenderer, type AdminFieldConfig } from '../../../components/admin/FieldRenderer'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import { Spinner } from '../../../components/ui/Spinner'
import { usePermissions } from '../../../hooks/usePermissions'
import { suppliersService } from '../../../services/master-data/suppliers.service'
import { cleanPayload } from '../../../utils/clean-payload'
import { Permission } from '../../../utils/permissions'
import { supplierSchema, type SupplierFormValues } from './supplier.schema'

const FIELDS: AdminFieldConfig<SupplierFormValues>[] = [
  { name: 'name', label: 'Nombre', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Teléfono', type: 'text' },
  { name: 'country', label: 'País', type: 'text' },
]

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.error?.message) return error.response.data.error.message
  return fallback
}

export function SupplierFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission(Permission.MASTER_DATA_EDIT)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isDeleteOpen, setDeleteOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => suppliersService.getById(id!),
    enabled: isEdit,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    values: data
      ? { name: data.name, email: data.email ?? '', phone: data.phone ?? '', country: data.country ?? '', is_active: data.is_active }
      : { name: '', email: '', phone: '', country: '', is_active: true },
  })

  const saveMutation = useMutation({
    mutationFn: (values: SupplierFormValues) => {
      const payload = cleanPayload(values)
      return isEdit ? suppliersService.update(id!, payload) : suppliersService.create(payload as never)
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      navigate(`/admin/suppliers/${saved.id}`, { replace: true })
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo guardar')),
  })

  const deleteMutation = useMutation({
    mutationFn: () => suppliersService.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      navigate('/admin/suppliers')
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo eliminar')),
  })

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <AdminFormShell
      title={isEdit ? data?.name ?? 'Proveedor' : 'Nuevo proveedor'}
      onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      serverError={serverError}
      isSubmitting={saveMutation.isPending}
      onCancel={() => navigate('/admin/suppliers')}
      extraActions={
        isEdit &&
        canEdit && (
          <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
            Eliminar
          </Button>
        )
      }
    >
      <fieldset disabled={!canEdit} className="contents">
        <FieldRenderer fields={FIELDS} register={register} errors={errors} />
        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register('is_active')} />
            Activo
          </label>
        )}
      </fieldset>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Eliminar proveedor"
        message="¿Confirmas eliminar este proveedor?"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false)
          deleteMutation.mutate()
        }}
      />
    </AdminFormShell>
  )
}
