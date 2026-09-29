import { Navigate, Outlet } from 'react-router'
import { usePermissions } from '../hooks/usePermissions'
import type { Permission } from '../utils/permissions'

interface PermissionRouteProps {
  permission: Permission | Permission[]
}

export function PermissionRoute({ permission }: PermissionRouteProps) {
  const { hasAnyPermission } = usePermissions()
  const required = Array.isArray(permission) ? permission : [permission]

  if (!hasAnyPermission(required)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
