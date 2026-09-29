import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { RangeItemType } from '../../utils/constants'
import type { TariffComponentFormInput } from './tariff-component.schema'

const TYPE_OPTIONS = Object.values(RangeItemType).map((type) => ({ value: type, label: type }))

type RangeExtraFieldName = 'amount' | 'rate' | 'base' | 'base_from' | 'block_size'

const FIELDS_BY_TYPE: Record<string, { name: RangeExtraFieldName; label: string }[]> = {
  fixed: [{ name: 'amount', label: 'Monto' }],
  per_unit: [{ name: 'rate', label: 'Tarifa' }],
  per_value: [{ name: 'rate', label: 'Tarifa' }],
  base_plus: [
    { name: 'base', label: 'Base' },
    { name: 'rate', label: 'Tarifa' },
    { name: 'base_from', label: 'Base desde' },
  ],
  block_ceil: [
    { name: 'base', label: 'Base' },
    { name: 'rate', label: 'Tarifa' },
    { name: 'block_size', label: 'Tamaño de bloque' },
    { name: 'base_from', label: 'Base desde' },
  ],
}

interface TariffRangesEditorProps {
  control: Control<TariffComponentFormInput>
  register: UseFormRegister<TariffComponentFormInput>
  errors: FieldErrors<TariffComponentFormInput>
  watchRanges: TariffComponentFormInput['tariff_ranges']
}

export function TariffRangesEditor({ control, register, errors, watchRanges }: TariffRangesEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'tariff_ranges' })

  return (
    <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Tramos</span>
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({ from: 0, to: '', type: RangeItemType.fixed })}
        >
          Agregar tramo
        </Button>
      </div>
      {errors.tariff_ranges?.message && <p className="text-sm text-red-600">{errors.tariff_ranges.message}</p>}

      {fields.map((field, index) => {
        const currentType = watchRanges?.[index]?.type ?? RangeItemType.fixed
        const extraFields = FIELDS_BY_TYPE[currentType] ?? []
        const rangeErrors = errors.tariff_ranges?.[index]

        return (
          <div key={field.id} className="grid gap-2 rounded border border-gray-100 p-2 sm:grid-cols-3">
            <Input label="Desde" type="number" error={rangeErrors?.from?.message} {...register(`tariff_ranges.${index}.from`)} />
            <Input label="Hasta (vacío = sin límite)" type="number" error={rangeErrors?.to?.message} {...register(`tariff_ranges.${index}.to`)} />
            <Select
              label="Tipo"
              options={TYPE_OPTIONS}
              {...register(`tariff_ranges.${index}.type`)}
            />
            {extraFields.map((f) => (
              <Input
                key={f.name}
                label={f.label}
                type="number"
                step="0.0001"
                error={(rangeErrors as Record<string, { message?: string }> | undefined)?.[f.name]?.message}
                {...register(`tariff_ranges.${index}.${f.name}` as `tariff_ranges.${number}.${RangeExtraFieldName}`)}
              />
            ))}
            <div className="flex items-end">
              <Button type="button" variant="danger" onClick={() => remove(index)}>
                Quitar tramo
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
