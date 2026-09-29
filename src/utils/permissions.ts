export const Role = {
  ADMIN: 'ADMIN',
  COMERCIAL: 'COMERCIAL',
  OPERACIONES: 'OPERACIONES',
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const Permission = {
  QUOTATION_CREATE: 'QUOTATION_CREATE',
  QUOTATION_VIEW: 'QUOTATION_VIEW',
  QUOTATION_EDIT: 'QUOTATION_EDIT',
  QUOTATION_CHANGE_STATE: 'QUOTATION_CHANGE_STATE',
  QUOTATION_CREATE_DRAFT: 'QUOTATION_CREATE_DRAFT',
  QUOTATION_VIEW_OPP: 'QUOTATION_VIEW_OPP',
  QUOTATION_EDIT_AFTER_SENT: 'QUOTATION_EDIT_AFTER_SENT',
  QUOTATION_COMPARE: 'QUOTATION_COMPARE',
  MASTER_DATA_VIEW: 'MASTER_DATA_VIEW',
  MASTER_DATA_EDIT: 'MASTER_DATA_EDIT',
  TARIFF_VIEW: 'TARIFF_VIEW',
  TARIFF_EDIT: 'TARIFF_EDIT',
  USER_MANAGE: 'USER_MANAGE',
  ROLE_MANAGE: 'ROLE_MANAGE',
  COUNTRY_CONFIG_EDIT: 'COUNTRY_CONFIG_EDIT',
  EXCHANGE_RATE_EDIT: 'EXCHANGE_RATE_EDIT',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]

// Espejo de src/config/constants.ts (ROLE_DEFAULT_PERMISSIONS) del backend — solo
// para UX (distinguir "permiso por rol" de "permiso extra otorgado"); el backend
// es la única fuente de verdad que calcula los permisos efectivos.
export const ROLE_DEFAULT_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: Object.values(Permission),
  COMERCIAL: [
    Permission.QUOTATION_CREATE,
    Permission.QUOTATION_VIEW,
    Permission.QUOTATION_EDIT,
    Permission.QUOTATION_CHANGE_STATE,
    Permission.QUOTATION_VIEW_OPP,
    Permission.MASTER_DATA_VIEW,
  ],
  OPERACIONES: [Permission.QUOTATION_VIEW, Permission.QUOTATION_CREATE_DRAFT, Permission.MASTER_DATA_VIEW],
}
