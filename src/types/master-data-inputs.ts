export interface CreateCountryInput {
  code: string
  name: string
  currency_id: string
}
export interface UpdateCountryInput {
  name?: string
  currency_id?: string
  is_active?: boolean
}

export interface CreateConsolidatorInput {
  name: string
  description?: string
  email?: string
  phone?: string
}
export type UpdateConsolidatorInput = Partial<CreateConsolidatorInput> & { is_active?: boolean }

export interface CreateCustomsAgentInput {
  name: string
  description?: string
  email?: string
  phone?: string
  license_number?: string
}
export type UpdateCustomsAgentInput = Partial<CreateCustomsAgentInput> & { is_active?: boolean }

export interface CreateSupplierInput {
  name: string
  email?: string
  phone?: string
  country?: string
}
export type UpdateSupplierInput = Partial<CreateSupplierInput> & { is_active?: boolean }

export interface CreatePalletInput {
  name: string
  description?: string
  max_weight_kg: number
  length_cm: number
  width_cm: number
  height_cm: number
  volume_cft: number
}
export type UpdatePalletInput = Partial<CreatePalletInput> & { is_active?: boolean }

export interface CreateClientInput {
  name: string
  tax_id?: string
  email?: string
  phone?: string
  address?: string
  country_id: string
}
export type UpdateClientInput = Partial<CreateClientInput> & { is_active?: boolean }

export interface CreateProductInput {
  name: string
  description?: string
  sku?: string
  supplier_id?: string
  weight_kg: number
  volume_cft: number
  customs_code?: string
}
export type UpdateProductInput = Partial<CreateProductInput> & { is_active?: boolean }

export interface CreateExchangeRateInput {
  from: string
  to: string
  rate: number
  date: string
}
