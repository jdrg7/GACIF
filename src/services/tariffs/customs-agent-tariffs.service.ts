import { api } from '../api'
import { createResourceService } from '../resource.factory'
import type { ComponentInput, CustomsAgentTariff, TariffComponent } from '../../types/tariff'

interface CreateTariffInput {
  customs_agent_id: string
  country_id: string
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

const base = createResourceService<CustomsAgentTariff, CreateTariffInput, UpdateTariffInput>(
  '/tariffs/customs-agent-tariffs',
)

export const customsAgentTariffsService = {
  ...base,
  addComponent: async (tariffId: string, input: ComponentInput) => {
    const response = await api.post<{ data: TariffComponent }>(
      `/tariffs/customs-agent-tariffs/${tariffId}/components`,
      input,
    )
    return response.data.data
  },
  updateComponent: async (tariffId: string, componentId: string, input: ComponentInput) => {
    const response = await api.patch<{ data: TariffComponent }>(
      `/tariffs/customs-agent-tariffs/${tariffId}/components/${componentId}`,
      input,
    )
    return response.data.data
  },
  removeComponent: async (tariffId: string, componentId: string) => {
    await api.delete(`/tariffs/customs-agent-tariffs/${tariffId}/components/${componentId}`)
  },
}
