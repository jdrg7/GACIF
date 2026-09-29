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
import { consolidatorsService } from '../../../services/master-data/consolidators.service'
import { cleanPayload } from '../../../utils/clean-payload'
import { Permission } from '../../../utils/permissions'
import { consolidatorSchema, type ConsolidatorFormValues } from './consolidator.schema'

const FIELDS: AdminFieldConfig<ConsolidatorFormValues>[] = [
  { name: 'name', label: 'Nombre', type: 'text' },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Teléfono', type: 'text' },
]

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.error?.message) return error.response.data.error.message
  return fallback
}

export function ConsolidatorFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission(Permission.MASTER_DATA_EDIT)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isDeleteOpen, setDeleteOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['consolidators', id],
    queryFn: () => consolidatorsService.getById(id!),
    enabled: isEdit,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<ConsolidatorFormValues>({
    resolver: zodResolver(consolidatorSchema),
    values: data
      ? { name: data.name, description: data.description ?? '', email: data.email ?? '', phone: data.phone ?? '', is_active: data.is_active }
      : { name: '', description: '', email: '', phone: '', is_active: true },
  })

  const saveMutation = useMutation({
    mutationFn: (values: ConsolidatorFormValues) => {
      const payload = cleanPayload(values)
      return isEdit ? consolidatorsService.update(id!, payload) : consolidatorsService.create(payload as never)
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['consolidators'] })
      navigate(`/admin/consolidators/${saved.id}`, { replace: true })
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo guardar')),
  })

  const deleteMutation = useMutation({
    mutationFn: () => consolidatorsService.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consolidators'] })
      navigate('/admin/consolidators')
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
      title={isEdit ? data?.name ?? 'Consolidador' : 'Nuevo consolidador'}
      onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      serverError={serverError}
      isSubmitting={saveMutation.isPending}
      onCancel={() => navigate('/admin/consolidators')}
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
        title="Eliminar consolidador"
        message="¿Confirmas eliminar este consolidador? Esta acción es reversible solo por soporte."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false)
          deleteMutation.mutate()
        }}
      />
    </AdminFormShell>
  )
}
