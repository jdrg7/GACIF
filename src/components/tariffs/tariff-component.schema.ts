import { z } from 'zod'
import { CalculationType, RangeItemType, TariffBasis } from '../../utils/constants'

const RANGE_TYPES = new Set<CalculationType>([
  CalculationType.RANGE_KG,
  CalculationType.RANGE_LB,
  CalculationType.RANGE_CFT,
  CalculationType.RANGE_VALUE,
])

const PER_UNIT_TYPES = new Set<CalculationType>([CalculationType.PER_KG, CalculationType.PER_LB, CalculationType.PER_CFT])

const optionalPositive = z.coerce.number().positive('Debe ser mayor a 0').optional().or(z.literal(''))

// Espejo exacto de src/modules/tariffs/shared/tariff-component-value.schema.ts del
// backend (requireField por calculation_type) — el backend valida de nuevo, esto es
// solo para dar feedback inmediato en el formulario.
export const tariffRangeItemSchema = z
  .object({
    from: z.coerce.number().nonnegative('Debe ser 0 o mayor'),
    to: z.coerce.number().positive().optional().or(z.literal('')),
    type: z.enum([
      RangeItemType.fixed,
      RangeItemType.per_unit,
      RangeItemType.base_plus,
      RangeItemType.block_ceil,
      RangeItemType.per_value,
    ]),
    amount: optionalPositive,
    rate: optionalPositive,
    base: optionalPositive,
    base_from: optionalPositive,
    block_size: optionalPositive,
    min: optionalPositive,
  })
  .superRefine((range, ctx) => {
    const require = (field: 'amount' | 'rate' | 'base' | 'base_from' | 'block_size') => {
      if (range[field] === undefined || range[field] === '') {
        ctx.addIssue({ code: 'custom', path: [field], message: `Requerido para el tipo "${range.type}"` })
      }
    }
    if (range.type === RangeItemType.fixed) require('amount')
    else if (range.type === RangeItemType.per_unit) require('rate')
    else if (range.type === RangeItemType.per_value) require('rate')
    else if (range.type === RangeItemType.base_plus) {
      require('base')
      require('rate')
      require('base_from')
    } else if (range.type === RangeItemType.block_ceil) {
      require('base')
      require('rate')
      require('block_size')
      require('base_from')
    }
  })

export const tariffComponentValueSchema = z
  .object({
    calculation_type: z.enum([
      CalculationType.FIXED,
      CalculationType.PER_KG,
      CalculationType.PER_LB,
      CalculationType.PER_CFT,
      CalculationType.PER_VALUE,
      CalculationType.MAX_OF,
      CalculationType.RANGE_KG,
      CalculationType.RANGE_LB,
      CalculationType.RANGE_CFT,
      CalculationType.RANGE_VALUE,
    ]),
    currency_id: z.string().min(1, 'Selecciona una moneda'),
    fixed_amount: optionalPositive,
    rate_per_unit: optionalPositive,
    rate_percentage: z.coerce
      .number()
      .positive()
      .max(10, 'Fuera de rango razonable (10 = 1000%)')
      .optional()
      .or(z.literal('')),
    minimum_amount: optionalPositive,
    maximum_amount: optionalPositive,
    basis_unit: z.enum([TariffBasis.KG, TariffBasis.LB, TariffBasis.CFT]).optional().or(z.literal('')),
    tariff_ranges: z.array(tariffRangeItemSchema).optional(),
    name: z.string().trim().min(1, 'El nombre es requerido').max(255),
    sort_order: z.coerce.number().int().nonnegative().optional().or(z.literal('')),
    notes: z.string().trim().max(2000).optional().or(z.literal('')),
    is_optional: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const requireField = (field: 'fixed_amount' | 'rate_per_unit' | 'rate_percentage' | 'minimum_amount' | 'basis_unit', message: string) => {
      if (data[field] === undefined || data[field] === '') {
        ctx.addIssue({ code: 'custom', path: [field], message })
      }
    }

    if (data.calculation_type === CalculationType.FIXED) {
      requireField('fixed_amount', 'fixed_amount es requerido para FIXED')
    } else if (PER_UNIT_TYPES.has(data.calculation_type)) {
      requireField('rate_per_unit', `rate_per_unit es requerido para ${data.calculation_type}`)
    } else if (data.calculation_type === CalculationType.PER_VALUE) {
      requireField('rate_percentage', 'rate_percentage es requerido para PER_VALUE')
    } else if (data.calculation_type === CalculationType.MAX_OF) {
      requireField('rate_per_unit', 'rate_per_unit es requerido para MAX_OF')
      requireField('minimum_amount', 'minimum_amount es requerido para MAX_OF')
      requireField('basis_unit', 'basis_unit es requerido para MAX_OF (KG, LB o CFT)')
    } else if (RANGE_TYPES.has(data.calculation_type)) {
      if (!data.tariff_ranges || data.tariff_ranges.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['tariff_ranges'], message: `tariff_ranges es requerido para ${data.calculation_type}` })
      }
    }
  })

export type TariffComponentFormInput = z.input<typeof tariffComponentValueSchema>
export type TariffComponentFormValues = z.output<typeof tariffComponentValueSchema>
export type TariffRangeItemInput = z.input<typeof tariffRangeItemSchema>
