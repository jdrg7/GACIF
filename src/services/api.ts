import axios from 'axios'
import { useAuthStore } from '../store/auth.store'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const response = await api.post<{ data: { accessToken: string } }>('/auth/refresh')
  return response.data.data.accessToken
}

const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout']

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => originalRequest?.url?.includes(path))
    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        refreshPromise ??= refreshAccessToken()
        const accessToken = await refreshPromise
        refreshPromise = null
        const { user } = useAuthStore.getState()
        if (user) useAuthStore.getState().setSession(user, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        refreshPromise = null
        useAuthStore.getState().clearSession()
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)
