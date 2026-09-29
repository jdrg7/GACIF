import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
