import { z } from 'zod'
import { TransportType } from '../../../utils/constants'

export const consolidatorTariffHeaderSchema = z.object({
  consolidator_id: z.string().min(1, 'Selecciona un consolidador'),
  country_id: z.string().min(1, 'Selecciona un país'),
  transport_type: z.enum([TransportType.AEREO, TransportType.MARITIMO]),
  name: z.string().trim().min(1, 'El nombre es requerido').max(255),
  valid_from: z.string().min(1, 'La fecha de inicio es requerida'),
  valid_until: z.string().optional().or(z.literal('')),
  volumetric_divisor: z
    .string()
    .min(1, 'El divisor volumétrico es requerido')
    .refine((value) => Number(value) > 0 && Number(value) <= 10000, 'Debe ser un número entre 0 y 10000'),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  is_active: z.boolean(),
})

export type ConsolidatorTariffHeaderFormValues = z.infer<typeof consolidatorTariffHeaderSchema>
