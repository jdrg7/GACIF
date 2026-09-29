import { z } from 'zod'

export const consolidatorSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(255),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  is_active: z.boolean(),
})

export type ConsolidatorFormValues = z.infer<typeof consolidatorSchema>
