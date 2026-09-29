import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import axios from 'axios'
import { AdminFormShell } from '../../../components/admin/AdminFormShell'
import { FieldRenderer, type AdminFieldConfig } from '../../../components/admin/FieldRenderer'
import { Spinner } from '../../../components/ui/Spinner'
import { usePermissions } from '../../../hooks/usePermissions'
import { palletsService } from '../../../services/master-data/pallets.service'
import { Permission } from '../../../utils/permissions'
import { palletSchema, type PalletFormInput, type PalletFormValues } from './pallet.schema'

const FIELDS: AdminFieldConfig<PalletFormInput>[] = [
  { name: 'name', label: 'Nombre', type: 'text' },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'max_weight_kg', label: 'Peso máximo (KG)', type: 'number', step: '0.001' },
  { name: 'length_cm', label: 'Largo (cm)', type: 'number', step: '0.01' },
  { name: 'width_cm', label: 'Ancho (cm)', type: 'number', step: '0.01' },
  { name: 'height_cm', label: 'Alto (cm)', type: 'number', step: '0.01' },
  { name: 'volume_cft', label: 'Volumen (CFT)', type: 'number', step: '0.001' },
]

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.error?.message) return error.response.data.error.message
  return fallback
}

export function PalletFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission(Permission.MASTER_DATA_EDIT)
  const [serverError, setServerError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['pallets', id],
    queryFn: () => palletsService.getById(id!),
    enabled: isEdit,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<PalletFormInput, unknown, PalletFormValues>({
    resolver: zodResolver(palletSchema),
    values: data
      ? {
          name: data.name,
          description: data.description ?? '',
          max_weight_kg: data.max_weight_kg,
          length_cm: data.length_cm,
          width_cm: data.width_cm,
          height_cm: data.height_cm,
          volume_cft: data.volume_cft,
          is_active: data.is_active,
        }
      : undefined,
  })

  const saveMutation = useMutation({
    mutationFn: (values: PalletFormValues) => {
      const { description, ...rest } = values
      const payload = { ...rest, ...(description ? { description } : {}) }
      return isEdit ? palletsService.update(id!, payload) : palletsService.create(payload)
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['pallets'] })
      navigate(`/admin/pallets/${saved.id}`, { replace: true })
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo guardar')),
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
      title={isEdit ? data?.name ?? 'Pallet' : 'Nuevo pallet'}
      onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      serverError={serverError}
      isSubmitting={saveMutation.isPending}
      onCancel={() => navigate('/admin/pallets')}
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
    </AdminFormShell>
  )
}
