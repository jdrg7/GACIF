import type { Control, FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { TariffRangesEditor } from './TariffRangesEditor'
import { CalculationType, TariffBasis } from '../../utils/constants'
import type { TariffComponentFormInput } from './tariff-component.schema'

const CALCULATION_TYPE_OPTIONS = Object.values(CalculationType).map((type) => ({ value: type, label: type }))
const TARIFF_BASIS_OPTIONS = [
  { value: '', label: 'Selecciona...' },
  ...Object.values(TariffBasis).map((basis) => ({ value: basis, label: basis })),
]

const RANGE_TYPES = new Set<string>([
  CalculationType.RANGE_KG,
  CalculationType.RANGE_LB,
  CalculationType.RANGE_CFT,
  CalculationType.RANGE_VALUE,
])
const PER_UNIT_TYPES = new Set<string>([CalculationType.PER_KG, CalculationType.PER_LB, CalculationType.PER_CFT])

interface CurrencyOption {
  value: string
  label: string
}

interface ComponentValueFieldsProps {
  register: UseFormRegister<TariffComponentFormInput>
  watch: UseFormWatch<TariffComponentFormInput>
  errors: FieldErrors<TariffComponentFormInput>
  control: Control<TariffComponentFormInput>
  currencyOptions: CurrencyOption[]
}

export function ComponentValueFields({ register, watch, errors, control, currencyOptions }: ComponentValueFieldsProps) {
  const calculationType = watch('calculation_type')
  const ranges = watch('tariff_ranges')

  return (
    <div className="flex flex-col gap-4">
      <Select
        label="Tipo de cálculo"
        options={CALCULATION_TYPE_OPTIONS}
        error={errors.calculation_type?.message}
        {...register('calculation_type')}
      />
      <Select
        label="Moneda"
        options={[{ value: '', label: 'Selecciona...' }, ...currencyOptions]}
        error={errors.currency_id?.message}
        {...register('currency_id')}
      />

      {calculationType === CalculationType.FIXED && (
        <Input label="Monto fijo" type="number" step="0.0001" error={errors.fixed_amount?.message} {...register('fixed_amount')} />
      )}

      {PER_UNIT_TYPES.has(calculationType) && (
        <Input label="Tarifa por unidad" type="number" step="0.0001" error={errors.rate_per_unit?.message} {...register('rate_per_unit')} />
      )}

      {calculationType === CalculationType.PER_VALUE && (
        <Input
          label="Porcentaje (ej. 0.15 = 15%)"
          type="number"
          step="0.0001"
          error={errors.rate_percentage?.message}
          {...register('rate_percentage')}
        />
      )}

      {calculationType === CalculationType.MAX_OF && (
        <>
          <Input label="Tarifa por unidad" type="number" step="0.0001" error={errors.rate_per_unit?.message} {...register('rate_per_unit')} />
          <Input label="Monto mínimo" type="number" step="0.0001" error={errors.minimum_amount?.message} {...register('minimum_amount')} />
          <Select label="Base (KG/LB/CFT)" options={TARIFF_BASIS_OPTIONS} error={errors.basis_unit?.message} {...register('basis_unit')} />
        </>
      )}

      {RANGE_TYPES.has(calculationType) && (
        <TariffRangesEditor control={control} register={register} errors={errors} watchRanges={ranges} />
      )}

      <Input label="Monto máximo (tope opcional)" type="number" step="0.0001" error={errors.maximum_amount?.message} {...register('maximum_amount')} />
    </div>
  )
}
