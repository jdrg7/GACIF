import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { CandidateBasis } from '../../utils/constants'
import type { TariffComponentFormInput } from './tariff-component.schema'

const BASIS_OPTIONS = [
  { value: CandidateBasis.KG, label: 'KG — peso real' },
  { value: CandidateBasis.VOL_KG, label: 'VOL_KG — peso volumétrico (kg)' },
  { value: CandidateBasis.LB, label: 'LB — peso real' },
  { value: CandidateBasis.VOL_LB, label: 'VOL_LB — peso volumétrico (lb)' },
  { value: CandidateBasis.CFT, label: 'CFT — volumen' },
]

interface BasisCandidatesEditorProps {
  control: Control<TariffComponentFormInput>
  register: UseFormRegister<TariffComponentFormInput>
  errors: FieldErrors<TariffComponentFormInput>
}

export function BasisCandidatesEditor({ control, register, errors }: BasisCandidatesEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'basis_candidates' })

  return (
    <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-700">Bases candidatas (opcional)</span>
          <p className="text-xs text-gray-500">
            Si agregas bases, se cobra la mayor de todas y se ignoran la tarifa, el mínimo y la base de arriba.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => append({ basis: CandidateBasis.KG, rate: 0, minimum: '' })}>
          Agregar base
        </Button>
      </div>

      {fields.map((field, index) => {
        const itemErrors = errors.basis_candidates?.[index]
        return (
          <div key={field.id} className="grid gap-2 rounded border border-gray-100 p-2 sm:grid-cols-3">
            <Select label="Base" options={BASIS_OPTIONS} {...register(`basis_candidates.${index}.basis`)} />
            <Input
              label="Tarifa por unidad"
              type="number"
              step="0.0001"
              error={itemErrors?.rate?.message}
              {...register(`basis_candidates.${index}.rate`)}
            />
            <Input
              label="Mínimo"
              type="number"
              step="0.0001"
              error={itemErrors?.minimum?.message}
              {...register(`basis_candidates.${index}.minimum`)}
            />
            <div className="flex items-end sm:col-span-3">
              <Button type="button" variant="danger" onClick={() => remove(index)}>
                Quitar base
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
