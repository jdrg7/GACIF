import type { QuotationStatus, ServiceLevel, TransportType } from '../utils/constants'

export const CostCategory = {
  CONSOLIDATOR: 'CONSOLIDATOR',
  CUSTOMS_AGENT: 'CUSTOMS_AGENT',
  INSURANCE: 'INSURANCE',
  OTHER_INTERNATIONAL: 'OTHER_INTERNATIONAL',
} as const

export type CostCategory = (typeof CostCategory)[keyof typeof CostCategory]

export interface QuotationProduct {
  id: string
  product_id: string
  quantity: number
  weight_kg_used: string
  weight_lb_used: string
  volume_cft_used: string
  fob_unit_price: string
  fob_total: string
}

// Una candidata evaluada de un cobro por volumen/peso (snapshot del motor).
export interface CostCandidateSnapshot {
  basis: string
  rate: number
  quantity: number
  minimum: number
  amount: number
}

export interface QuotationCostDetail {
  id: string
  scenario_id: string | null
  category: CostCategory
  component_name: string
  sort_order: number
  original_amount: string
  original_currency: string
  exchange_rate: string | null
  amount_usd: string
  calculation_basis: string | null
  basis_value: string | null
  is_manual_override: boolean
  override_reason: string | null
  calculation_snapshot?: { candidates?: CostCandidateSnapshot[] } & Record<string, unknown>
  // Impuesto de paso (ej. ISV): se muestra en el desglose pero no se suma al
  // total_cost de la cotización.
  is_tax: boolean
}

// Un modo de transporte calculado completo (consolidador + agente) con sus propios totales.
export interface QuotationScenario {
  id: string
  transport_type: TransportType
  consolidator_tariff_id: string
  volumetric_weight_lb: string
  chargeable_weight_kg: string
  subtotal_consolidator: string
  cif: string
  subtotal_customs_agent: string
  total_cost: string
  margin_amount: string
  margin_percentage: string
  sale_price: string
  nationalization_base: string
  nationalization_percentage: string
  // El detalle trae las líneas de cada escenario; la comparativa por OPP solo los totales.
  cost_details?: QuotationCostDetail[]
}

export interface AuditStateChange {
  id: string
  from_status: QuotationStatus
  to_status: QuotationStatus
  changed_by: string
  changed_at: string
  reason: string | null
}

export interface Quotation {
  id: string
  reference_number: string
  opportunity_id: number | null
  status: QuotationStatus
  // Modo ELEGIDO: los totales de abajo son los de ese escenario.
  transport_type: TransportType
  service_level: ServiceLevel
  // false = elegido por defecto (el más barato); true = lo eligió el comercial.
  scenario_chosen: boolean
  client_id: string
  country_id: string
  consolidator_id: string
  customs_agent_id: string
  pallet_id: string | null
  exchange_rate: string
  exchange_rate_date: string
  total_weight_kg: string
  total_weight_lb: string
  total_volume_cft: string
  fob: string
  insurance: string
  other_international_costs: string
  subtotal_consolidator: string
  cif: string
  subtotal_customs_agent: string
  total_cost: string
  margin_amount: string
  margin_percentage: string
  sale_price: string
  nationalization_base: string
  nationalization_percentage: string
  observations: string | null
  internal_notes: string | null
  responsible_user_id: string
  sent_at: string | null
  won_at: string | null
  closed_at: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
  // Solo presentes en el detalle (GET /quotations/:id); ausentes en el listado.
  products?: QuotationProduct[]
  // `cost_details` son las líneas del escenario elegido; `scenarios` trae todos los modos.
  cost_details?: QuotationCostDetail[]
  scenarios?: QuotationScenario[]
  audit_state_changes?: AuditStateChange[]
}

export type QuotationDetail = Quotation &
  Required<Pick<Quotation, 'products' | 'cost_details' | 'scenarios' | 'audit_state_changes'>>

export interface QuotationProductInput {
  product_id: string
  quantity: number
  weight_kg_override?: number
  weight_lb_override?: number
  volume_cft_override?: number
  fob_unit_price: number
}

export interface CreateQuotationInput {
  opportunity_id?: number
  client_id: string
  country_id: string
  // Opcional: se calculan todos los modos con tarifa vigente.
  transport_type?: TransportType
  service_level?: ServiceLevel
  consolidator_id: string
  customs_agent_id: string
  pallet_id?: string
  products: QuotationProductInput[]
  // Oculto en la UI por ahora; el backend lo toma como 0 si no se envía.
  margin_amount?: number
  excluded_component_ids?: string[]
  observations?: string
  internal_notes?: string
}
