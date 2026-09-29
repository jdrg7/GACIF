import { api } from './api'
import type { AuthUser } from '../store/auth.store'

interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<{ data: AuthResponse }>('/auth/login', { email, password })
  return response.data.data
}

export async function refresh(): Promise<AuthResponse> {
  const response = await api.post<{ data: AuthResponse }>('/auth/refresh')
  return response.data.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}
