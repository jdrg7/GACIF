import type { Role } from '../utils/permissions'
import type { Permission } from '../utils/permissions'

export interface UserListItem {
  id: string
  email: string
  full_name: string
  role: Role
  is_active: boolean
  created_at: string
}

export interface UserDetail extends UserListItem {
  permissions: Permission[]
}

export interface CreateUserInput {
  email: string
  password: string
  full_name: string
  role: Role
}

export interface UpdateUserInput {
  full_name?: string
  role?: Role
  is_active?: boolean
}
