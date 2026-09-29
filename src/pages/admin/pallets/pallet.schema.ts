import { z } from 'zod'

export const palletSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(100),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  max_weight_kg: z.coerce.number().positive('Debe ser mayor a 0'),
  length_cm: z.coerce.number().positive('Debe ser mayor a 0'),
  width_cm: z.coerce.number().positive('Debe ser mayor a 0'),
  height_cm: z.coerce.number().positive('Debe ser mayor a 0'),
  volume_cft: z.coerce.number().positive('Debe ser mayor a 0'),
  is_active: z.boolean(),
})

export type PalletFormInput = z.input<typeof palletSchema>
export type PalletFormValues = z.output<typeof palletSchema>
