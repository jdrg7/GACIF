import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import axios from 'axios'
import { AdminFormShell } from '../../../components/admin/AdminFormShell'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Spinner } from '../../../components/ui/Spinner'
import { usePermissions } from '../../../hooks/usePermissions'
import { countriesService } from '../../../services/master-data/countries.service'
import { currenciesService } from '../../../services/master-data/currencies.service'
import { Permission } from '../../../utils/permissions'
import { countrySchema, type CountryFormValues } from './country.schema'

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.error?.message) return error.response.data.error.message
  return fallback
}

export function CountryFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission(Permission.COUNTRY_CONFIG_EDIT)
  const [serverError, setServerError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['countries', id],
    queryFn: () => countriesService.getById(id!),
    enabled: isEdit,
  })
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => currenciesService.list() })
  const currencyOptions = [
    { value: '', label: 'Selecciona...' },
    ...(currencies ?? []).map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` })),
  ]

  const { register, handleSubmit, formState: { errors } } = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    values: data
      ? { code: data.code, name: data.name, currency_id: data.currency_id, is_active: data.is_active }
      : { code: '', name: '', currency_id: '', is_active: true },
  })

  const saveMutation = useMutation({
    mutationFn: (values: CountryFormValues) =>
      isEdit
        ? countriesService.update(id!, { name: values.name, currency_id: values.currency_id, is_active: values.is_active })
        : countriesService.create({ code: values.code, name: values.name, currency_id: values.currency_id }),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
      navigate(`/admin/countries/${saved.id}`, { replace: true })
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
      title={isEdit ? data?.name ?? 'País' : 'Nuevo país'}
      onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      serverError={serverError}
      isSubmitting={saveMutation.isPending}
      onCancel={() => navigate('/admin/countries')}
    >
      <fieldset disabled={!canEdit} className="contents">
        <Input label="Código ISO" disabled={isEdit} error={errors.code?.message} {...register('code')} />
        <Input label="Nombre" error={errors.name?.message} {...register('name')} />
        <Select label="Moneda" options={currencyOptions} error={errors.currency_id?.message} {...register('currency_id')} />
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
