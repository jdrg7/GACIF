import { api } from '../api'
import type { ExchangeRate } from '../../types/master-data'
import type { CreateExchangeRateInput } from '../../types/master-data-inputs'

interface PaginatedEnvelope<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export const exchangeRatesService = {
  list: async (params?: Record<string, unknown>) => {
    const response = await api.get<PaginatedEnvelope<ExchangeRate>>('/master-data/exchange-rates', { params })
    return response.data
  },
  create: async (input: CreateExchangeRateInput) => {
    const response = await api.post<{ data: ExchangeRate }>('/master-data/exchange-rates', input)
    return response.data.data
  },
}
