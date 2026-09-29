import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(255),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  sku: z.string().trim().max(100).optional().or(z.literal('')),
  supplier_id: z.string().optional().or(z.literal('')),
  weight_kg: z.coerce.number().positive('Debe ser mayor a 0'),
  volume_cft: z.coerce.number().positive('Debe ser mayor a 0'),
  customs_code: z.string().trim().max(50).optional().or(z.literal('')),
  is_active: z.boolean(),
})

export type ProductFormInput = z.input<typeof productSchema>
export type ProductFormValues = z.output<typeof productSchema>
