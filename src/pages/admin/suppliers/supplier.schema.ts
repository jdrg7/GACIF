import { z } from 'zod'

export const supplierSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(255),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  is_active: z.boolean(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>
