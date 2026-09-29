import { useAuthStore } from '../store/auth.store'
import type { Permission } from '../utils/permissions'

export function usePermissions() {
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])

  function hasPermission(permission: Permission): boolean {
    return permissions.includes(permission)
  }

  function hasAnyPermission(required: Permission[]): boolean {
    return required.some((permission) => permissions.includes(permission))
  }

  return { permissions, hasPermission, hasAnyPermission }
}
