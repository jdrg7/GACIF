import { z } from 'zod'
import { TransportType } from '../../utils/constants'

const quotationProductSchema = z.object({
  product_id: z.string().min(1, 'Selecciona un producto'),
  quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
  fob_unit_price: z.coerce.number().positive('El precio FOB debe ser mayor a 0'),
})

export const createQuotationSchema = z.object({
  opportunity_id: z.coerce.number().int().positive().optional().or(z.literal('')),
  client_id: z.string().min(1, 'Selecciona un cliente'),
  country_id: z.string().min(1, 'Selecciona un país'),
  transport_type: z.nativeEnum(TransportType),
  consolidator_id: z.string().min(1, 'Selecciona un consolidador'),
  customs_agent_id: z.string().min(1, 'Selecciona un agente aduanero'),
  pallet_id: z.string().optional(),
  products: z.array(quotationProductSchema).min(1, 'Agrega al menos un producto'),
  other_international_costs: z.coerce.number().nonnegative().default(0),
  margin_amount: z.coerce.number().nonnegative('El margen no puede ser negativo'),
  observations: z.string().trim().max(2000).optional(),
  internal_notes: z.string().trim().max(2000).optional(),
})

// z.coerce en varios campos hace que el tipo de entrada (lo que RHF guarda mientras
// el usuario escribe) difiera del tipo de salida (lo que el resolver produce al validar).
export type CreateQuotationFormInput = z.input<typeof createQuotationSchema>
export type CreateQuotationFormValues = z.output<typeof createQuotationSchema>
