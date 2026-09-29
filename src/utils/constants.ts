export const QuotationStatus = {
  BORRADOR: 'BORRADOR',
  PENDIENTE: 'PENDIENTE',
  ENVIADA: 'ENVIADA',
  VIGENTE: 'VIGENTE',
  GANADA: 'GANADA',
  EN_PROCESO: 'EN_PROCESO',
  ALTERNATIVA: 'ALTERNATIVA',
  CERRADA: 'CERRADA',
  RECHAZADA: 'RECHAZADA',
  CANCELADA: 'CANCELADA',
  ARCHIVADA: 'ARCHIVADA',
} as const

export type QuotationStatus = (typeof QuotationStatus)[keyof typeof QuotationStatus]

export const TransportType = {
  AEREO: 'AEREO',
  MARITIMO: 'MARITIMO',
} as const

export type TransportType = (typeof TransportType)[keyof typeof TransportType]

// Espejo de src/modules/quotations/quotations.state-machine.ts del backend — solo
// para UX (qué opciones ofrecer); el backend es la única fuente de verdad que valida.
export const QUOTATION_TRANSITIONS: Record<QuotationStatus, QuotationStatus[]> = {
  BORRADOR: [QuotationStatus.PENDIENTE, QuotationStatus.CANCELADA],
  PENDIENTE: [QuotationStatus.ENVIADA, QuotationStatus.ALTERNATIVA, QuotationStatus.CANCELADA],
  ENVIADA: [QuotationStatus.VIGENTE, QuotationStatus.CANCELADA],
  VIGENTE: [QuotationStatus.GANADA, QuotationStatus.RECHAZADA, QuotationStatus.CANCELADA],
  GANADA: [QuotationStatus.EN_PROCESO, QuotationStatus.VIGENTE, QuotationStatus.CANCELADA],
  EN_PROCESO: [QuotationStatus.CERRADA],
  ALTERNATIVA: [QuotationStatus.ENVIADA, QuotationStatus.CANCELADA],
  RECHAZADA: [QuotationStatus.ARCHIVADA],
  CANCELADA: [QuotationStatus.ARCHIVADA],
  CERRADA: [QuotationStatus.ARCHIVADA],
  ARCHIVADA: [],
}

export const QUOTATION_REASON_REQUIRED = new Set<QuotationStatus>([
  QuotationStatus.RECHAZADA,
  QuotationStatus.CANCELADA,
])

export const CalculationType = {
  FIXED: 'FIXED',
  PER_KG: 'PER_KG',
  PER_LB: 'PER_LB',
  PER_CFT: 'PER_CFT',
  PER_VALUE: 'PER_VALUE',
  MAX_OF: 'MAX_OF',
  RANGE_KG: 'RANGE_KG',
  RANGE_LB: 'RANGE_LB',
  RANGE_CFT: 'RANGE_CFT',
  RANGE_VALUE: 'RANGE_VALUE',
} as const

export type CalculationType = (typeof CalculationType)[keyof typeof CalculationType]

export const TariffBasis = {
  KG: 'KG',
  LB: 'LB',
  CFT: 'CFT',
} as const

export type TariffBasis = (typeof TariffBasis)[keyof typeof TariffBasis]

export const RangeItemType = {
  fixed: 'fixed',
  per_unit: 'per_unit',
  base_plus: 'base_plus',
  block_ceil: 'block_ceil',
  per_value: 'per_value',
} as const

export type RangeItemType = (typeof RangeItemType)[keyof typeof RangeItemType]
