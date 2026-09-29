export interface Country {
  id: string
  code: string
  name: string
  currency_id: string
  is_active: boolean
}

export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
}

export interface Consolidator {
  id: string
  name: string
  description: string | null
  email: string | null
  phone: string | null
  is_active: boolean
}

export interface CustomsAgent {
  id: string
  name: string
  description: string | null
  email: string | null
  phone: string | null
  license_number: string | null
  is_active: boolean
}

export interface Supplier {
  id: string
  name: string
  email: string | null
  phone: string | null
  country: string | null
  is_active: boolean
}

export interface Pallet {
  id: string
  name: string
  description: string | null
  max_weight_kg: string
  length_cm: string
  width_cm: string
  height_cm: string
  volume_cft: string
  is_active: boolean
}

export interface Client {
  id: string
  name: string
  tax_id: string | null
  email: string | null
  phone: string | null
  address: string | null
  country_id: string
  is_active: boolean
}

export interface Product {
  id: string
  name: string
  description: string | null
  sku: string | null
  supplier_id: string | null
  weight_kg: string
  weight_lb: string
  volume_cft: string
  customs_code: string | null
  is_active: boolean
}

export interface ExchangeRate {
  id: string
  from_currency_id: string
  to_currency_id: string
  rate: string
  date: string
  created_at: string
}

// Genérico para combos (id + name) usado en selects de master-data.
export interface NamedEntity {
  id: string
  name: string
  is_active: boolean
}
