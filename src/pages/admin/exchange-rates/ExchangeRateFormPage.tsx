import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { AdminFormShell } from '../../../components/admin/AdminFormShell'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { exchangeRatesService } from '../../../services/master-data/exchange-rates.service'
import { currenciesService } from '../../../services/master-data/currencies.service'
import { exchangeRateSchema, type ExchangeRateFormInput, type ExchangeRateFormValues } from './exchange-rate.schema'

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.error?.message) return error.response.data.error.message
  return fallback
}

export function ExchangeRateFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => currenciesService.list() })
  const currencyOptions = [
    { value: '', label: 'Selecciona...' },
    ...(currencies ?? []).map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` })),
  ]

  const { register, handleSubmit, formState: { errors } } = useForm<ExchangeRateFormInput, unknown, ExchangeRateFormValues>({
    resolver: zodResolver(exchangeRateSchema),
    defaultValues: { from: '', to: '', date: new Date().toISOString().slice(0, 10) },
  })

  const saveMutation = useMutation({
    mutationFn: (values: ExchangeRateFormValues) => exchangeRatesService.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] })
      navigate('/admin/exchange-rates')
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'No se pudo guardar')),
  })

  return (
    <AdminFormShell
      title="Nuevo tipo de cambio"
      onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      serverError={serverError}
      isSubmitting={saveMutation.isPending}
      onCancel={() => navigate('/admin/exchange-rates')}
    >
      <Select label="Moneda de origen" options={currencyOptions} error={errors.from?.message} {...register('from')} />
      <Select label="Moneda de destino" options={currencyOptions} error={errors.to?.message} {...register('to')} />
      <Input label="Tasa" type="number" step="0.000001" error={errors.rate?.message} {...register('rate')} />
      <Input label="Fecha" type="date" error={errors.date?.message} {...register('date')} />
    </AdminFormShell>
  )
}
