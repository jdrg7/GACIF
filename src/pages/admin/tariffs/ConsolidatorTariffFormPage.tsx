import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import axios from 'axios'
import { AdminFormShell } from '../../../components/admin/AdminFormShell'
import { FieldRenderer, type AdminFieldConfig } from '../../../components/admin/FieldRenderer'
import { Spinner } from '../../../components/ui/Spinner'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import { TariffComponentsTable } from '../../../components/tariffs/TariffComponentsTable'
import { ComponentFormModal } from '../../../components/tariffs/ComponentFormModal'
import { usePermissions } from '../../../hooks/usePermissions'
import { consolidatorTariffsService } from '../../../services/tariffs/consolidator-tariffs.service'
import { consolidatorsService } from '../../../services/master-data/consolidators.service'
import { countriesService } from '../../../services/master-data/countries.service'
import { currenciesService } from '../../../services/master-data/currencies.service'
import { Permission } from '../../../utils/permissions'
import { TransportType } from '../../../utils/constants'
import { consolidatorTariffHeaderSchema, type ConsolidatorTariffHeaderFormValues } from './consolidator-tariff.schema'
import type { TariffComponentFormValues } from '../../../components/tariffs/tariff-component.schema'
import type { TariffComponent } from '../../../types/tariff'

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.error?.message) return error.response.data.error.message
  return fallback
}

export function ConsolidatorTariffFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission(Permission.TARIFF_EDIT)
  const [serverError, setServerError] = useState<string | null>(null)
  const [componentModal, setComponentModal] = useState<{ open: boolean; component: TariffComponent | null }>({
    open: false,
    component: null,
  })
  const [componentError, setComponentError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TariffComponent | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['consolidator-tariffs', id],
    queryFn: () => consolidatorTariffsService.getById(id!),
    enabled: isEdit,
  })
  const { data: consolidators } = useQuery({ queryKey: ['consolidators', { limit: 100 }], queryFn: () => consolidatorsService.list({ limit: 100 }) })
  const { data: countries } = useQuery({ queryKey: ['countries', { limit: 100 }], queryFn: () => countriesService.list({ limit: 100 }) })
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => currenciesService.list() })
  const currencyOptions = (currencies ?? []).map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))

  const FIELDS: AdminFieldConfig<ConsolidatorTariffHeaderFormValues>[] = [
    {
      name: 'consolidator_id',
      label: 'Consolidador',
      type: 'select',
      options: [{ value: '', label: 'Selecciona...' }, ...(consolidators?.data ?? []).map((c) => ({ value: c.id, label: c.name }))],
    },
    {
      name: 'country_id',
      label: 'País',
      type: 'select',
      options: [{ value: '', label: 'Selecciona...' }, ...(countries?.data ?? []).map((c) => ({ value: c.id, label: c.name }))],
    },
    {
      name: 'transport_type',
      label: 'Transporte',
      type: 'select',
      options: [
        { value: TransportType.AEREO, label: 'Aéreo' },
        { value: TransportType.MARITIMO, label: 'Marítimo' },
      ],
    },
    { name: 'name', label: 'Nombre de la tarifa', type: 'text' },
    { name: 'valid_from', label: 'Vigente desde', type: 'text' },
    { name: 'valid_until', label: 'Vigente hasta (opcional)', type: 'text' },
    { name: 'notes', label: 'Notas', type: 'textarea' },
  ]

  const { register, handleSubmit, formState: { errors } } = useForm<ConsolidatorTariffHeaderFormValues>({
    resolver: zodResolver(consolidatorTariffHeaderSchema),
    values: data
      ? {
          consolidator_id: data.consolidator_id,
          country_id: data.country_id,
          transport_type: data.transport_type,
          name: data.name,
          valid_from: data.valid_from.slice(0, 10),
          valid_until: data.valid_until ? data.valid_until.slice(0, 10) : '',
          notes: data.notes ?? '',
          is_active: data.is_active,
        }
      : {
          consolidator_id: '',
          country_id: '',
          transport_type: TransportType.AEREO,
          name: '',
          valid_from: new Date().toISOString().slice(0, 10),
          valid_until: '',
          notes: '',
          is_active: true,
        },
  })

  const saveMutation = useMutation({
    mutationFn: (values: ConsolidatorTariffHeaderFormValues) =>
      isEdit
        ? consolidatorTariffsService.update(id!, {
            name: values.name,
            valid_until: values.valid_until || undefined,
            notes: values.notes || undefined,
            is_active: values.is_active,
          })
        : consolidatorTariffsService.create({
            consolidator_id: values.consolidator_id,
            country_id: values.country_id,
            transport_type: values.transport_type,
            name: values.name,
            valid_from: values.valid_from,
            valid_until: values.valid_until || undefined,
            notes: values.notes || undefined,
          }),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['consolidator-tariffs'] })
      navigate(`/admin/tariffs/consolidator/${saved.id}`, { replace: true })
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo guardar')),
  })

  const componentMutation = useMutation({
    mutationFn: (values: TariffComponentFormValues) => {
      const payload = {
        calculation_type: values.calculation_type,
        currency_id: values.currency_id,
        name: values.name,
        ...(values.fixed_amount !== '' && values.fixed_amount !== undefined ? { fixed_amount: values.fixed_amount } : {}),
        ...(values.rate_per_unit !== '' && values.rate_per_unit !== undefined ? { rate_per_unit: values.rate_per_unit } : {}),
        ...(values.rate_percentage !== '' && values.rate_percentage !== undefined ? { rate_percentage: values.rate_percentage } : {}),
        ...(values.minimum_amount !== '' && values.minimum_amount !== undefined ? { minimum_amount: values.minimum_amount } : {}),
        ...(values.maximum_amount !== '' && values.maximum_amount !== undefined ? { maximum_amount: values.maximum_amount } : {}),
        ...(values.basis_unit !== '' && values.basis_unit !== undefined ? { basis_unit: values.basis_unit } : {}),
        ...(values.sort_order !== '' && values.sort_order !== undefined ? { sort_order: values.sort_order } : {}),
        ...(values.notes ? { notes: values.notes } : {}),
        ...(values.tariff_ranges && values.tariff_ranges.length > 0
          ? {
              tariff_ranges: values.tariff_ranges.map((r) => ({
                from: r.from,
                ...(r.to !== '' && r.to !== undefined ? { to: r.to } : { to: null }),
                type: r.type,
                ...(r.amount !== '' && r.amount !== undefined ? { amount: r.amount } : {}),
                ...(r.rate !== '' && r.rate !== undefined ? { rate: r.rate } : {}),
                ...(r.base !== '' && r.base !== undefined ? { base: r.base } : {}),
                ...(r.base_from !== '' && r.base_from !== undefined ? { base_from: r.base_from } : {}),
                ...(r.block_size !== '' && r.block_size !== undefined ? { block_size: r.block_size } : {}),
                ...(r.min !== '' && r.min !== undefined ? { min: r.min } : {}),
              })),
            }
          : {}),
      }
      return componentModal.component
        ? consolidatorTariffsService.updateComponent(id!, componentModal.component.id, payload)
        : consolidatorTariffsService.addComponent(id!, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consolidator-tariffs', id] })
      setComponentModal({ open: false, component: null })
      setComponentError(null)
    },
    onError: (error) => setComponentError(extractErrorMessage(error, 'No se pudo guardar el componente')),
  })

  const deleteComponentMutation = useMutation({
    mutationFn: (componentId: string) => consolidatorTariffsService.removeComponent(id!, componentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consolidator-tariffs', id] })
      setDeleteTarget(null)
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo eliminar el componente')),
  })

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminFormShell
        title={isEdit ? data?.name ?? 'Tarifa' : 'Nueva tarifa de consolidador'}
        onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
        serverError={serverError}
        isSubmitting={saveMutation.isPending}
        onCancel={() => navigate('/admin/tariffs/consolidator')}
      >
        <fieldset disabled={!canEdit} className="contents">
          <FieldRenderer
            fields={isEdit ? FIELDS.filter((f) => !['consolidator_id', 'country_id', 'transport_type', 'valid_from'].includes(f.name)) : FIELDS}
            register={register}
            errors={errors}
          />
          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register('is_active')} />
              Activa
            </label>
          )}
        </fieldset>
      </AdminFormShell>

      {isEdit && data && (
        <>
          <TariffComponentsTable
            components={data.components ?? []}
            onAdd={() => setComponentModal({ open: true, component: null })}
            onEdit={(component) => setComponentModal({ open: true, component })}
            onDelete={(component) => setDeleteTarget(component)}
          />

          <ComponentFormModal
            key={componentModal.open ? (componentModal.component?.id ?? 'new') : 'closed'}
            isOpen={componentModal.open}
            onClose={() => setComponentModal({ open: false, component: null })}
            component={componentModal.component}
            showIsOptional={false}
            currencyOptions={currencyOptions}
            isSubmitting={componentMutation.isPending}
            error={componentError}
            onSubmit={(values) => componentMutation.mutate(values)}
          />

          <ConfirmDialog
            isOpen={Boolean(deleteTarget)}
            title="Eliminar componente"
            message={`¿Confirmas eliminar "${deleteTarget?.name}"?`}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => deleteTarget && deleteComponentMutation.mutate(deleteTarget.id)}
          />
        </>
      )}
    </div>
  )
}
