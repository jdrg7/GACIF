import { api } from '../api'
import { createResourceService } from '../resource.factory'
import type { ComponentInput, ConsolidatorTariff, TariffComponent } from '../../types/tariff'

interface CreateTariffInput {
  consolidator_id: string
  country_id: string
  transport_type: string
  name: string
  valid_from: string
  valid_until?: string
  notes?: string
}

interface UpdateTariffInput {
  name?: string
  valid_until?: string
  notes?: string
  is_active?: boolean
}

const base = createResourceService<ConsolidatorTariff, CreateTariffInput, UpdateTariffInput>(
  '/tariffs/consolidator-tariffs',
)

export const consolidatorTariffsService = {
  ...base,
  addComponent: async (tariffId: string, input: ComponentInput) => {
    const response = await api.post<{ data: TariffComponent }>(
      `/tariffs/consolidator-tariffs/${tariffId}/components`,
      input,
    )
    return response.data.data
  },
  updateComponent: async (tariffId: string, componentId: string, input: ComponentInput) => {
    const response = await api.patch<{ data: TariffComponent }>(
      `/tariffs/consolidator-tariffs/${tariffId}/components/${componentId}`,
      input,
    )
    return response.data.data
  },
  removeComponent: async (tariffId: string, componentId: string) => {
    await api.delete(`/tariffs/consolidator-tariffs/${tariffId}/components/${componentId}`)
  },
}
