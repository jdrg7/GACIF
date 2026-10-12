import type { QuotationStatus, TransportType } from '../utils/constants'

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

export interface QuotationCostDetail {
  id: string
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
  // Impuesto de paso (ej. ISV): se muestra en el desglose pero no se suma al
  // total_cost de la cotización.
  is_tax: boolean
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
  transport_type: TransportType
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
  cost_details?: QuotationCostDetail[]
  audit_state_changes?: AuditStateChange[]
}

export type QuotationDetail = Quotation &
  Required<Pick<Quotation, 'products' | 'cost_details' | 'audit_state_changes'>>

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
  transport_type: TransportType
  consolidator_id: string
  customs_agent_id: string
  pallet_id?: string
  products: QuotationProductInput[]
  other_international_costs?: number
  margin_amount: number
  excluded_component_ids?: string[]
  observations?: string
  internal_notes?: string
}
