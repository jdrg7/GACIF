import { api } from './api'
import { createResourceService } from './resource.factory'
import type { CreateUserInput, UpdateUserInput, UserDetail, UserListItem } from '../types/user'
import type { Permission } from '../utils/permissions'

const base = createResourceService<UserListItem, CreateUserInput, UpdateUserInput>('/users')

export const usersService = {
  ...base,
  getById: (id: string) => base.getById(id) as unknown as Promise<UserDetail>,
  create: (input: CreateUserInput) => base.create(input) as unknown as Promise<UserDetail>,
  update: (id: string, input: UpdateUserInput) => base.update(id, input) as unknown as Promise<UserDetail>,
  resetPassword: async (id: string, newPassword: string) => {
    await api.patch(`/users/${id}/reset-password`, { newPassword })
  },
  grantPermission: async (id: string, permission: Permission) => {
    const response = await api.post<{ data: UserDetail }>(`/users/${id}/permissions`, { permission })
    return response.data.data
  },
  revokePermission: async (id: string, permission: Permission) => {
    const response = await api.delete<{ data: UserDetail }>(`/users/${id}/permissions/${permission}`)
    return response.data.data
  },
}
