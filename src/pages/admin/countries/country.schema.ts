import { z } from 'zod'

export const countrySchema = z.object({
  code: z.string().trim().min(2).max(3, 'Código ISO de 2 o 3 letras'),
  name: z.string().trim().min(1, 'El nombre es requerido').max(100),
  currency_id: z.string().min(1, 'Selecciona una moneda'),
  is_active: z.boolean(),
})

export type CountryFormValues = z.infer<typeof countrySchema>
