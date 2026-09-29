import { z } from 'zod'
import { Role } from '../../../utils/permissions'

export const createUserSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  full_name: z.string().trim().min(1, 'El nombre completo es requerido').max(255),
  role: z.nativeEnum(Role),
})

export const editUserSchema = z.object({
  full_name: z.string().trim().min(1, 'El nombre completo es requerido').max(255),
  role: z.nativeEnum(Role),
  is_active: z.boolean(),
})

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type EditUserFormValues = z.infer<typeof editUserSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
