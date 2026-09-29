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
import { clientsService } from '../../../services/master-data/clients.service'
import { countriesService } from '../../../services/master-data/countries.service'
import { cleanPayload } from '../../../utils/clean-payload'
import { Permission } from '../../../utils/permissions'
import { clientSchema, type ClientFormValues } from './client.schema'

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.error?.message) return error.response.data.error.message
  return fallback
}

export function ClientFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission(Permission.MASTER_DATA_EDIT)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isDeleteOpen, setDeleteOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsService.getById(id!),
    enabled: isEdit,
  })
  const { data: countries } = useQuery({ queryKey: ['countries', { limit: 100 }], queryFn: () => countriesService.list({ limit: 100 }) })

  const FIELDS: AdminFieldConfig<ClientFormValues>[] = [
    { name: 'name', label: 'Nombre', type: 'text' },
    { name: 'tax_id', label: 'RTN/NIT', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Teléfono', type: 'text' },
    { name: 'address', label: 'Dirección', type: 'textarea' },
    {
      name: 'country_id',
      label: 'País',
      type: 'select',
      options: [{ value: '', label: 'Selecciona...' }, ...(countries?.data ?? []).map((c) => ({ value: c.id, label: c.name }))],
    },
  ]

  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    values: data
      ? {
          name: data.name,
          tax_id: data.tax_id ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          country_id: data.country_id,
          is_active: data.is_active,
        }
      : { name: '', tax_id: '', email: '', phone: '', address: '', country_id: '', is_active: true },
  })

  const saveMutation = useMutation({
    mutationFn: (values: ClientFormValues) => {
      const payload = cleanPayload(values)
      return isEdit ? clientsService.update(id!, payload) : clientsService.create(payload as never)
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      navigate(`/admin/clients/${saved.id}`, { replace: true })
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo guardar')),
  })

  const deleteMutation = useMutation({
    mutationFn: () => clientsService.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      navigate('/admin/clients')
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
      title={isEdit ? data?.name ?? 'Cliente' : 'Nuevo cliente'}
      onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      serverError={serverError}
      isSubmitting={saveMutation.isPending}
      onCancel={() => navigate('/admin/clients')}
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
        title="Eliminar cliente"
        message="¿Confirmas eliminar este cliente?"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false)
          deleteMutation.mutate()
        }}
      />
    </AdminFormShell>
  )
}
