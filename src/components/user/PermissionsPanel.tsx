import { Permission, ROLE_DEFAULT_PERMISSIONS, type Role } from '../../utils/permissions'

interface PermissionsPanelProps {
  role: Role
  grantedPermissions: Permission[]
  onToggle: (permission: Permission, grant: boolean) => void
  isPending?: boolean
}

export function PermissionsPanel({ role, grantedPermissions, onToggle, isPending }: PermissionsPanelProps) {
  const roleDefaults = new Set(ROLE_DEFAULT_PERMISSIONS[role])
  const granted = new Set(grantedPermissions)

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {Object.values(Permission).map((permission) => {
        const isRoleDefault = roleDefaults.has(permission)
        const isChecked = isRoleDefault || granted.has(permission)

        return (
          <label
            key={permission}
            className={`flex items-center gap-2 text-sm ${isRoleDefault ? 'text-gray-400' : 'text-gray-700'}`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              disabled={isRoleDefault || isPending}
              onChange={(event) => onToggle(permission, event.target.checked)}
            />
            {permission}
            {isRoleDefault && <span className="text-xs">(rol)</span>}
          </label>
        )
      })}
    </div>
  )
}
