import { api } from './api'

interface ApiEnvelope<T> {
  success: true
  data: T
}

interface PaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export function createResourceService<TEntity, TCreate = Partial<TEntity>, TUpdate = Partial<TEntity>>(
  basePath: string,
) {
  return {
    list: async (params?: Record<string, unknown>) => {
      const response = await api.get<PaginatedEnvelope<TEntity>>(basePath, { params })
      return response.data
    },
    getById: async (id: string) => {
      const response = await api.get<ApiEnvelope<TEntity>>(`${basePath}/${id}`)
      return response.data.data
    },
    create: async (data: TCreate) => {
      const response = await api.post<ApiEnvelope<TEntity>>(basePath, data)
      return response.data.data
    },
    update: async (id: string, data: TUpdate) => {
      const response = await api.patch<ApiEnvelope<TEntity>>(`${basePath}/${id}`, data)
      return response.data.data
    },
    remove: async (id: string) => {
      await api.delete(`${basePath}/${id}`)
    },
  }
}
