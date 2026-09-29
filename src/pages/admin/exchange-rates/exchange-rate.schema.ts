import { z } from 'zod'

export const exchangeRateSchema = z.object({
  from: z.string().min(1, 'Selecciona la moneda de origen'),
  to: z.string().min(1, 'Selecciona la moneda de destino'),
  rate: z.coerce.number().positive('Debe ser mayor a 0'),
  date: z.string().min(1, 'La fecha es requerida'),
})

export type ExchangeRateFormInput = z.input<typeof exchangeRateSchema>
export type ExchangeRateFormValues = z.output<typeof exchangeRateSchema>
