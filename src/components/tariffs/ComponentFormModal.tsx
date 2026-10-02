import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { ComponentValueFields } from './ComponentValueFields'
import { CalculationType } from '../../utils/constants'
import {
  tariffComponentValueSchema,
  type TariffComponentFormInput,
  type TariffComponentFormValues,
} from './tariff-component.schema'
import type { TariffComponent } from '../../types/tariff'

interface ComponentFormModalProps {
  isOpen: boolean
  onClose: () => void
  component: TariffComponent | null
  showIsOptional: boolean
  currencyOptions: { value: string; label: string }[]
  onSubmit: (values: TariffComponentFormValues) => void
  isSubmitting?: boolean
  error?: string | null
}

function toFormValues(component: TariffComponent | null): TariffComponentFormInput {
  if (!component) {
    return {
      calculation_type: CalculationType.FIXED,
      currency_id: '',
      name: '',
      fixed_amount: '',
      rate_per_unit: '',
      rate_percentage: '',
      minimum_amount: '',
      maximum_amount: '',
      basis_unit: '',
      sort_order: '',
      notes: '',
      tariff_ranges: [],
      is_optional: false,
      is_tax: false,
    }
  }
  return {
    calculation_type: component.calculation_type,
    currency_id: component.currency_id,
    name: component.name,
    fixed_amount: component.fixed_amount ?? '',
    rate_per_unit: component.rate_per_unit ?? '',
    rate_percentage: component.rate_percentage ?? '',
    minimum_amount: component.minimum_amount ?? '',
    maximum_amount: component.maximum_amount ?? '',
    basis_unit: component.basis_unit ?? '',
    sort_order: component.sort_order,
    notes: component.notes ?? '',
    tariff_ranges: component.tariff_ranges ?? [],
    is_optional: component.is_optional ?? false,
    is_tax: component.is_tax ?? false,
  }
}

export function ComponentFormModal({
  isOpen,
  onClose,
  component,
  showIsOptional,
  currencyOptions,
  onSubmit,
  isSubmitting,
  error,
}: ComponentFormModalProps) {
  const {
    register,
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TariffComponentFormInput, unknown, TariffComponentFormValues>({
    resolver: zodResolver(tariffComponentValueSchema),
    values: isOpen ? toFormValues(component) : undefined,
  })

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={component ? 'Editar componente' : 'Nuevo componente'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        <Input label="Nombre" error={errors.name?.message} {...register('name')} />
        <ComponentValueFields register={register} watch={watch} errors={errors} control={control} currencyOptions={currencyOptions} />
        <Input label="Orden (opcional)" type="number" error={errors.sort_order?.message} {...register('sort_order')} />
        <Input label="Notas (opcional)" error={errors.notes?.message} {...register('notes')} />
        {showIsOptional && (
          <>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register('is_optional')} />
              Es un componente opcional (excluible por cotización)
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register('is_tax')} />
              Es un impuesto (ej. ISV) — se muestra en el desglose pero no se suma al costo total
            </label>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
