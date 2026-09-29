import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(255),
  tax_id: z.string().trim().max(50).optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  address: z.string().trim().max(2000).optional().or(z.literal('')),
  country_id: z.string().min(1, 'Selecciona un país'),
  is_active: z.boolean(),
})

export type ClientFormValues = z.infer<typeof clientSchema>
