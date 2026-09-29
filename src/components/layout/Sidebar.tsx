import { NavLink } from 'react-router'
import { usePermissions } from '../../hooks/usePermissions'
import { Permission } from '../../utils/permissions'

interface SidebarLink {
  to: string
  label: string
  permission?: Permission
}

interface SidebarGroup {
  label?: string
  links: SidebarLink[]
}

const GROUPS: SidebarGroup[] = [
  {
    links: [
      { to: '/', label: 'Dashboard' },
      { to: '/quotations', label: 'Cotizaciones' },
      { to: '/quotations/compare', label: 'Comparar por OPP', permission: Permission.QUOTATION_COMPARE },
    ],
  },
  {
    label: 'Datos maestros',
    links: [
      { to: '/admin/clients', label: 'Clientes', permission: Permission.MASTER_DATA_VIEW },
      { to: '/admin/products', label: 'Productos', permission: Permission.MASTER_DATA_VIEW },
      { to: '/admin/suppliers', label: 'Proveedores', permission: Permission.MASTER_DATA_VIEW },
      { to: '/admin/pallets', label: 'Pallets', permission: Permission.MASTER_DATA_VIEW },
      { to: '/admin/consolidators', label: 'Consolidadores', permission: Permission.MASTER_DATA_VIEW },
      { to: '/admin/customs-agents', label: 'Agentes aduaneros', permission: Permission.MASTER_DATA_VIEW },
      { to: '/admin/countries', label: 'Países', permission: Permission.MASTER_DATA_VIEW },
      { to: '/admin/currencies', label: 'Monedas', permission: Permission.MASTER_DATA_VIEW },
      { to: '/admin/exchange-rates', label: 'Tipos de cambio', permission: Permission.MASTER_DATA_VIEW },
    ],
  },
  {
    label: 'Tarifas',
    links: [
      { to: '/admin/tariffs/consolidator', label: 'Tarifas de consolidador', permission: Permission.TARIFF_VIEW },
      { to: '/admin/tariffs/customs-agent', label: 'Tarifas de agente aduanero', permission: Permission.TARIFF_VIEW },
    ],
  },
  {
    label: 'Administración',
    links: [{ to: '/admin/users', label: 'Usuarios', permission: Permission.USER_MANAGE }],
  },
]

export function Sidebar() {
  const { hasPermission } = usePermissions()

  return (
    <nav className="flex w-56 flex-col gap-4 overflow-y-auto border-r border-gray-200 p-4">
      {GROUPS.map((group) => {
        const visibleLinks = group.links.filter((link) => !link.permission || hasPermission(link.permission))
        if (visibleLinks.length === 0) return null

        return (
          <div key={group.label ?? 'root'} className="flex flex-col gap-1">
            {group.label && (
              <span className="px-3 text-xs font-medium uppercase tracking-wide text-gray-400">{group.label}</span>
            )}
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )
      })}
    </nav>
  )
}
