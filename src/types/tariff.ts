import type {
  CalculationType,
  CandidateBasis,
  RangeItemType,
  ServiceLevel,
  TariffBasis,
  TransportType,
} from '../utils/constants'

// Una base candidata de un MAX_OF multi-base: se cobra la mayor entre todas.
export interface BasisCandidate {
  basis: CandidateBasis
  rate: number
  minimum?: number
}

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
  // Solo MAX_OF de consolidador: cobra el mayor entre las bases (reemplaza tarifa/mínimo/base).
  basis_candidates?: BasisCandidate[]
}

export interface TariffComponent extends TariffComponentValue {
  id: string
  name: string
  sort_order: number
  notes: string | null
  // Solo consolidador: null = aplica a ambos niveles; si no, solo cuando la cotización tiene ese nivel.
  service_level?: ServiceLevel | null
  is_optional?: boolean
  // Solo aplica a componentes de agente aduanero (ej. ISV): se muestra en el
  // desglose pero no se suma al costo total de la cotización.
  is_tax?: boolean
}

export interface ConsolidatorTariff {
  id: string
  consolidator_id: string
  country_id: string
  transport_type: TransportType
  name: string
  valid_from: string
  valid_until: string | null
  // Pulgadas cúbicas por libra volumétrica (PFI: 166). Decimal del backend, llega como string.
  volumetric_divisor: string
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
  service_level?: ServiceLevel
  is_optional?: boolean
  is_tax?: boolean
}
