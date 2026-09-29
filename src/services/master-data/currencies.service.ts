import { api } from '../api'
import type { Currency } from '../../types/master-data'

export const currenciesService = {
  list: async () => {
    const response = await api.get<{ data: Currency[] }>('/master-data/currencies')
    return response.data.data
  },
}
