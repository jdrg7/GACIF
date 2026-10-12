import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { useState } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Spinner } from '../../components/ui/Spinner'
import { usePermissions } from '../../hooks/usePermissions'
import { clientsService } from '../../services/master-data/clients.service'
import { countriesService } from '../../services/master-data/countries.service'
import { consolidatorsService } from '../../services/master-data/consolidators.service'
import { customsAgentsService } from '../../services/master-data/customs-agents.service'
import { productsService } from '../../services/master-data/products.service'
import { palletsService } from '../../services/master-data/pallets.service'
import { quotationsService } from '../../services/quotations.service'
import { Permission } from '../../utils/permissions'
import { TransportType } from '../../utils/constants'
import {
  createQuotationSchema,
  type CreateQuotationFormInput,
  type CreateQuotationFormValues,
} from './quotation.schema'
import type { CreateQuotationInput } from '../../types/quotation'

const LIST_ALL = { limit: 100 }

export function QuotationCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: clients } = useQuery({ queryKey: ['clients', LIST_ALL], queryFn: () => clientsService.list(LIST_ALL) })
  const { data: countries } = useQuery({
    queryKey: ['countries', LIST_ALL],
    queryFn: () => countriesService.list(LIST_ALL),
  })
  const { data: consolidators } = useQuery({
    queryKey: ['consolidators', LIST_ALL],
    queryFn: () => consolidatorsService.list(LIST_ALL),
  })
  const { data: customsAgents } = useQuery({
    queryKey: ['customs-agents', LIST_ALL],
    queryFn: () => customsAgentsService.list(LIST_ALL),
  })
  const { data: products } = useQuery({
    queryKey: ['products', LIST_ALL],
    queryFn: () => productsService.list(LIST_ALL),
  })
  const { data: pallets } = useQuery({ queryKey: ['pallets', LIST_ALL], queryFn: () => palletsService.list(LIST_ALL) })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuotationFormInput, unknown, CreateQuotationFormValues>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      transport_type: TransportType.AEREO,
      other_international_costs: 0,
      products: [{ product_id: '', quantity: 1, fob_unit_price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'products' })

  const createMutation = useMutation({
    mutationFn: (input: CreateQuotationInput) => quotationsService.create(input),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      navigate(`/quotations/${created.id}`, { replace: true })
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        setServerError(error.response.data.error.message)
      } else {
        setServerError('No se pudo crear la cotización')
      }
    },
  })

  function onSubmit(values: CreateQuotationFormValues) {
    setServerError(null)
    const input: CreateQuotationInput = {
      client_id: values.client_id,
      country_id: values.country_id,
      transport_type: values.transport_type,
      consolidator_id: values.consolidator_id,
      customs_agent_id: values.customs_agent_id,
      products: values.products.map((p) => ({
        product_id: p.product_id,
        quantity: p.quantity,
        fob_unit_price: p.fob_unit_price,
      })),
      other_international_costs: values.other_international_costs,
      margin_amount: values.margin_amount,
      ...(values.pallet_id ? { pallet_id: values.pallet_id } : {}),
      ...(values.opportunity_id ? { opportunity_id: Number(values.opportunity_id) } : {}),
      ...(values.observations ? { observations: values.observations } : {}),
      ...(values.internal_notes ? { internal_notes: values.internal_notes } : {}),
    }
    createMutation.mutate(input)
  }

  const namedOptions = (items?: { id: string; name: string }[]) => [
    { value: '', label: 'Selecciona...' },
    ...(items ?? []).map((item) => ({ value: item.id, label: item.name })),
  ]

  if (!clients || !countries || !consolidators || !customsAgents || !products) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <PageWrapper title="Nueva cotización">
      <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-3xl flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Cliente" options={namedOptions(clients.data)} error={errors.client_id?.message} {...register('client_id')} />
          <Select label="País" options={namedOptions(countries.data)} error={errors.country_id?.message} {...register('country_id')} />
          <Select
            label="Transporte"
            options={[
              { value: TransportType.AEREO, label: 'Aéreo' },
              { value: TransportType.MARITIMO, label: 'Marítimo' },
            ]}
            {...register('transport_type')}
          />
          <Select
            label="Consolidador"
            options={namedOptions(consolidators.data)}
            error={errors.consolidator_id?.message}
            {...register('consolidator_id')}
          />
          <Select
            label="Agente aduanero"
            options={namedOptions(customsAgents.data)}
            error={errors.customs_agent_id?.message}
            {...register('customs_agent_id')}
          />
          <Select label="Pallet (opcional)" options={namedOptions(pallets?.data)} {...register('pallet_id')} />
          {hasPermission(Permission.QUOTATION_VIEW_OPP) && (
            <Input label="OPP (opcional)" type="number" {...register('opportunity_id')} />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Productos</h3>
            <Button
              type="button"
              variant="secondary"
              onClick={() => append({ product_id: '', quantity: 1, fob_unit_price: 0 })}
            >
              Agregar producto
            </Button>
          </div>
          {errors.products?.root && <p className="text-sm text-red-600">{errors.products.root.message}</p>}

          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
              <Select
                label="Producto"
                options={namedOptions(products.data)}
                error={errors.products?.[index]?.product_id?.message}
                {...register(`products.${index}.product_id`)}
              />
              <Input
                label="Cantidad"
                type="number"
                error={errors.products?.[index]?.quantity?.message}
                {...register(`products.${index}.quantity`)}
              />
              <Input
                label="FOB unitario"
                type="number"
                step="0.01"
                error={errors.products?.[index]?.fob_unit_price?.message}
                {...register(`products.${index}.fob_unit_price`)}
              />
              <div className="flex items-end">
                <Button type="button" variant="danger" disabled={fields.length <= 1} onClick={() => remove(index)}>
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Otros costos internacionales"
            type="number"
            step="0.01"
            error={errors.other_international_costs?.message}
            {...register('other_international_costs')}
          />
          <Input
            label="Margen (USD)"
            type="number"
            step="0.01"
            error={errors.margin_amount?.message}
            {...register('margin_amount')}
          />
        </div>

        <Input label="Observaciones (visibles para el cliente)" {...register('observations')} />
        <Input label="Notas internas" {...register('internal_notes')} />

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate('/quotations')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
            {createMutation.isPending ? 'Creando...' : 'Crear cotización'}
          </Button>
        </div>
      </form>
    </PageWrapper>
  )
}
