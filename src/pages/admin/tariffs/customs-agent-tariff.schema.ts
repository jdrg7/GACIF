import { z } from 'zod'

export const customsAgentTariffHeaderSchema = z.object({
  customs_agent_id: z.string().min(1, 'Selecciona un agente aduanero'),
  country_id: z.string().min(1, 'Selecciona un país'),
  name: z.string().trim().min(1, 'El nombre es requerido').max(255),
  valid_from: z.string().min(1, 'La fecha de inicio es requerida'),
  valid_until: z.string().optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  is_active: z.boolean(),
})

export type CustomsAgentTariffHeaderFormValues = z.infer<typeof customsAgentTariffHeaderSchema>
