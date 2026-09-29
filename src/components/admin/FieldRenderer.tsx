import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export interface AdminFieldConfig<T extends FieldValues> {
  name: Path<T>
  label: string
  type: 'text' | 'textarea' | 'email' | 'number' | 'select' | 'checkbox'
  options?: { value: string; label: string }[]
  step?: string
}

interface FieldRendererProps<T extends FieldValues> {
  fields: AdminFieldConfig<T>[]
  register: UseFormRegister<T>
  errors: FieldErrors<T>
}

export function FieldRenderer<T extends FieldValues>({ fields, register, errors }: FieldRendererProps<T>) {
  return (
    <>
      {fields.map((field) => {
        const error = errors[field.name]?.message as string | undefined

        if (field.type === 'select') {
          return (
            <Select
              key={field.name}
              label={field.label}
              options={field.options ?? []}
              error={error}
              {...register(field.name)}
            />
          )
        }

        if (field.type === 'checkbox') {
          return (
            <label key={field.name} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register(field.name)} />
              {field.label}
            </label>
          )
        }

        if (field.type === 'textarea') {
          return (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              <textarea
                className={`rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
                rows={3}
                {...register(field.name)}
              />
              {error && <span className="text-xs text-red-600">{error}</span>}
            </div>
          )
        }

        return (
          <Input
            key={field.name}
            label={field.label}
            type={field.type}
            step={field.step}
            error={error}
            {...register(field.name)}
          />
        )
      })}
    </>
  )
}
