import type { CalculationType, RangeItemType, TariffBasis, TransportType } from '../utils/constants'

export interface TariffRangeItem {
  from: number
  to: number | null
  type: RangeItemType
  amount?: number
  rate?: number
  base?: number
  base_from?: number
  block_size?: number
  min?: number
}

export interface TariffComponentValue {
  calculation_type: CalculationType
  currency_id: string
  fixed_amount?: number
  rate_per_unit?: number
  rate_percentage?: number
  minimum_amount?: number
  maximum_amount?: number
  tariff_ranges?: TariffRangeItem[]
  basis_unit?: TariffBasis
}

export interface TariffComponent extends TariffComponentValue {
  id: string
  name: string
  sort_order: number
  notes: string | null
  is_optional?: boolean
}

export interface ConsolidatorTariff {
  id: string
  consolidator_id: string
  country_id: string
  transport_type: TransportType
  name: string
  valid_from: string
  valid_until: string | null
  notes: string | null
  is_active: boolean
  components?: TariffComponent[]
}

export interface CustomsAgentTariff {
  id: string
  customs_agent_id: string
  country_id: string
  name: string
  valid_from: string
  valid_until: string | null
  notes: string | null
  is_active: boolean
  components?: TariffComponent[]
}

export type ComponentInput = TariffComponentValue & {
  name: string
  sort_order?: number
  notes?: string
  is_optional?: boolean
}
