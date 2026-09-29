import { api } from './api'
import { createResourceService } from './resource.factory'
import type { QuotationStatus } from '../utils/constants'
import type { CreateQuotationInput, Quotation, QuotationDetail } from '../types/quotation'

const base = createResourceService<Quotation, CreateQuotationInput>('/quotations')

export const quotationsService = {
  ...base,
  getById: (id: string) => base.getById(id) as Promise<QuotationDetail>,
  changeState: async (id: string, toStatus: QuotationStatus, reason?: string) => {
    const response = await api.post<{ data: QuotationDetail }>(`/quotations/${id}/state`, {
      to_status: toStatus,
      reason,
    })
    return response.data.data
  },
  compareByOpportunity: async (opportunityId: number) => {
    const response = await api.get<{ data: Quotation[] }>('/quotations/compare', {
      params: { opportunity_id: opportunityId },
    })
    return response.data.data
  },
  overrideCostDetail: async (quotationId: string, costDetailId: string, amountUsd: number, reason: string) => {
    const response = await api.patch<{ data: QuotationDetail }>(
      `/quotations/${quotationId}/cost-details/${costDetailId}/override`,
      { amount_usd: amountUsd, reason },
    )
    return response.data.data
  },
  revertCostDetail: async (quotationId: string, costDetailId: string, reason?: string) => {
    const response = await api.delete<{ data: QuotationDetail }>(
      `/quotations/${quotationId}/cost-details/${costDetailId}/override`,
      { data: { reason } },
    )
    return response.data.data
  },
}
