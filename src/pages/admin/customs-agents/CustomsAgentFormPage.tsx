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
import { customsAgentsService } from '../../../services/master-data/customs-agents.service'
import { cleanPayload } from '../../../utils/clean-payload'
import { Permission } from '../../../utils/permissions'
import { customsAgentSchema, type CustomsAgentFormValues } from './customs-agent.schema'

const FIELDS: AdminFieldConfig<CustomsAgentFormValues>[] = [
  { name: 'name', label: 'Nombre', type: 'text' },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Teléfono', type: 'text' },
  { name: 'license_number', label: 'Número de licencia', type: 'text' },
]

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.error?.message) return error.response.data.error.message
  return fallback
}

export function CustomsAgentFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission(Permission.MASTER_DATA_EDIT)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isDeleteOpen, setDeleteOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['customs-agents', id],
    queryFn: () => customsAgentsService.getById(id!),
    enabled: isEdit,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<CustomsAgentFormValues>({
    resolver: zodResolver(customsAgentSchema),
    values: data
      ? {
          name: data.name,
          description: data.description ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          license_number: data.license_number ?? '',
          is_active: data.is_active,
        }
      : { name: '', description: '', email: '', phone: '', license_number: '', is_active: true },
  })

  const saveMutation = useMutation({
    mutationFn: (values: CustomsAgentFormValues) => {
      const payload = cleanPayload(values)
      return isEdit ? customsAgentsService.update(id!, payload) : customsAgentsService.create(payload as never)
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['customs-agents'] })
      navigate(`/admin/customs-agents/${saved.id}`, { replace: true })
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo guardar')),
  })

  const deleteMutation = useMutation({
    mutationFn: () => customsAgentsService.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customs-agents'] })
      navigate('/admin/customs-agents')
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
      title={isEdit ? data?.name ?? 'Agente aduanero' : 'Nuevo agente aduanero'}
      onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      serverError={serverError}
      isSubmitting={saveMutation.isPending}
      onCancel={() => navigate('/admin/customs-agents')}
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
        title="Eliminar agente aduanero"
        message="¿Confirmas eliminar este agente aduanero?"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false)
          deleteMutation.mutate()
        }}
      />
    </AdminFormShell>
  )
}
